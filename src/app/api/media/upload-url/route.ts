import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { assertSuperAdmin } from "@/lib/security/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { mediaUploadSchema } from "@/lib/validation/wedding";
import { getEntitlements } from "@/features/entitlements";
import type { PackageName } from "@/features/weddings/types";

export async function POST(request: Request) {
  try {
    await assertSuperAdmin();
    const input = mediaUploadSchema.parse(await request.json());
    const admin = createAdminSupabaseClient();
    const { data: wedding } = await admin.from("weddings").select("package").eq("id", input.weddingId).single();
    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    const entitlements = getEntitlements(wedding.package as PackageName);
    if (input.purpose === "music" && !entitlements.backgroundMusic) return NextResponse.json({ error: "Background music is not included in this package" }, { status: 403 });
    if (input.purpose === "gallery") {
      const { count } = await admin.from("wedding_media").select("id", { count: "exact", head: true }).eq("wedding_id", input.weddingId).eq("purpose", "gallery");
      if ((count ?? 0) >= entitlements.galleryLimit) return NextResponse.json({ error: `This package allows ${entitlements.galleryLimit} gallery images` }, { status: 409 });
    }
    const extension = input.fileName.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || (input.purpose === "music" ? "mp3" : "jpg");
    const path = `${input.weddingId}/${randomUUID()}.${extension}`;
    const { data, error } = await admin.storage.from("wedding-media").createSignedUploadUrl(path);
    if (error) throw error;
    return NextResponse.json({ path, token: data.token, purpose: input.purpose, mimeType: input.mimeType, size: input.size, altText: input.altText });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload could not be prepared" }, { status: 400 });
  }
}
