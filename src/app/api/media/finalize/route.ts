import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { assertSuperAdmin } from "@/lib/security/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { postgresUuidSchema } from "@/lib/validation/wedding";

const schema = z.object({ weddingId: postgresUuidSchema, path: z.string().min(1), purpose: z.enum(["hero", "portrait", "gallery", "wedding_party", "texture", "music"]), mimeType: z.string(), size: z.number().positive(), altText: z.string().max(240), focalX: z.number().min(0).max(100), focalY: z.number().min(0).max(100) });

export async function POST(request: Request) {
  try {
    await assertSuperAdmin();
    const input = schema.parse(await request.json());
    if (!input.path.startsWith(`${input.weddingId}/`)) throw new Error("Invalid storage path");
    const admin = createAdminSupabaseClient();
    const folder = input.path.split("/")[0];
    const file = input.path.split("/")[1];
    const { data: objects, error: listError } = await admin.storage.from("wedding-media").list(folder, { search: file, limit: 1 });
    if (listError || !objects?.some((object) => object.name === file)) throw new Error("Uploaded object was not found");
    const { data: wedding } = await admin.from("weddings").select("slug,status,published_snapshot").eq("id", input.weddingId).single();
    if (!wedding) throw new Error("Wedding not found");
    const preservePublishedMedia = ["published", "scheduled"].includes(wedding.status) && Boolean(wedding.published_snapshot);
    if (["hero", "portrait", "texture", "music"].includes(input.purpose)) {
      const { data: previous } = await admin.from("wedding_media").select("id,storage_path").eq("wedding_id", input.weddingId).eq("purpose", input.purpose).eq("active", true);
      const paths = (previous ?? []).map((item) => item.storage_path);
      if (preservePublishedMedia) {
        const ids = (previous ?? []).map((item) => item.id);
        if (ids.length) await admin.from("wedding_media").update({ active: false }).in("id", ids);
      } else {
        if (paths.length) await admin.storage.from("wedding-media").remove(paths);
        await admin.from("wedding_media").delete().eq("wedding_id", input.weddingId).eq("purpose", input.purpose).eq("active", true);
      }
    }
    const { data, error } = await admin.from("wedding_media").insert({ wedding_id: input.weddingId, purpose: input.purpose, storage_path: input.path, mime_type: input.mimeType, byte_size: input.size, alt_text: input.altText, metadata: { focalX: input.focalX, focalY: input.focalY }, active: true }).select("id").single();
    if (error) throw error;
    if (input.purpose === "gallery") await admin.from("wedding_gallery").insert({ wedding_id: input.weddingId, media_id: data.id, alt_text: input.altText });
    await admin.from("weddings").update({ has_unpublished_changes: true }).eq("id", input.weddingId);
    revalidatePath(`/admin/weddings/${input.weddingId}`);
    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload could not be finalized" }, { status: 400 });
  }
}
