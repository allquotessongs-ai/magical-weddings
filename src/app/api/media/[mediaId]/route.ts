import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { assertSuperAdmin, getCurrentSuperAdmin } from "@/lib/security/auth";

export async function GET(_request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  try {
    const { mediaId } = await context.params;
    const admin = createAdminSupabaseClient();
    const { data } = await admin.from("wedding_media").select("storage_path,weddings!inner(status,publish_at)").eq("id", mediaId).maybeSingle();
    if (!data) return new NextResponse("Not found", { status: 404 });
    const weddingJoin = data.weddings as unknown as { status: string; publish_at: string | null } | Array<{ status: string; publish_at: string | null }>;
    const wedding = Array.isArray(weddingJoin) ? weddingJoin[0] : weddingJoin;
    const isPublic = wedding?.status === "published" || (wedding?.status === "scheduled" && wedding.publish_at && new Date(wedding.publish_at).getTime() <= Date.now());
    if (!isPublic && !(await getCurrentSuperAdmin())) return new NextResponse("Not found", { status: 404 });
    const { data: signed, error } = await admin.storage.from("wedding-media").createSignedUrl(data.storage_path, 300);
    if (error || !signed) return new NextResponse("Media unavailable", { status: 502 });
    return NextResponse.redirect(signed.signedUrl, { status: 307, headers: { "Cache-Control": isPublic ? "public, max-age=240" : "private, no-store" } });
  } catch {
    return new NextResponse("Media unavailable", { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  try {
    await assertSuperAdmin();
    const { mediaId } = await context.params;
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from("wedding_media").select("wedding_id,storage_path,weddings!inner(slug,status,published_snapshot)").eq("id", mediaId).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Media was not found" }, { status: 404 });
    const weddingJoin = data.weddings as unknown as { slug: string; status: string; published_snapshot: unknown } | Array<{ slug: string; status: string; published_snapshot: unknown }>;
    const wedding = Array.isArray(weddingJoin) ? weddingJoin[0] : weddingJoin;
    const preservePublishedMedia = ["published", "scheduled"].includes(wedding?.status) && Boolean(wedding?.published_snapshot);
    if (preservePublishedMedia) {
      const { error: deactivateError } = await admin.from("wedding_media").update({ active: false }).eq("id", mediaId);
      if (deactivateError) throw deactivateError;
      await admin.from("wedding_gallery").delete().eq("media_id", mediaId);
      await admin.from("wedding_party_members").update({ media_id: null }).eq("media_id", mediaId);
    } else {
      const { error: storageError } = await admin.storage.from("wedding-media").remove([data.storage_path]);
      if (storageError) throw storageError;
      const { error: databaseError } = await admin.from("wedding_media").delete().eq("id", mediaId);
      if (databaseError) throw databaseError;
    }
    await admin.from("weddings").update({ has_unpublished_changes: true }).eq("id", data.wedding_id);
    revalidatePath(`/admin/weddings/${data.wedding_id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Media could not be removed" }, { status: 400 });
  }
}
