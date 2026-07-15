import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { assertSuperAdmin } from "@/lib/security/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const schema = z.object({ weddingId: z.string().uuid(), path: z.string().min(1), purpose: z.enum(["hero", "portrait", "gallery", "wedding_party", "texture", "music"]), mimeType: z.string(), size: z.number().positive(), altText: z.string().max(240) });

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
    if (["hero", "portrait", "texture", "music"].includes(input.purpose)) {
      const { data: previous } = await admin.from("wedding_media").select("storage_path").eq("wedding_id", input.weddingId).eq("purpose", input.purpose);
      const paths = (previous ?? []).map((item) => item.storage_path);
      if (paths.length) await admin.storage.from("wedding-media").remove(paths);
      await admin.from("wedding_media").delete().eq("wedding_id", input.weddingId).eq("purpose", input.purpose);
    }
    const { data, error } = await admin.from("wedding_media").insert({ wedding_id: input.weddingId, purpose: input.purpose, storage_path: input.path, mime_type: input.mimeType, byte_size: input.size, alt_text: input.altText }).select("id").single();
    if (error) throw error;
    if (input.purpose === "gallery") await admin.from("wedding_gallery").insert({ wedding_id: input.weddingId, media_id: data.id, alt_text: input.altText });
    const { data: wedding } = await admin.from("weddings").select("slug").eq("id", input.weddingId).single();
    if (wedding?.slug) revalidatePath(`/${wedding.slug}`);
    revalidatePath(`/admin/weddings/${input.weddingId}`);
    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload could not be finalized" }, { status: 400 });
  }
}
