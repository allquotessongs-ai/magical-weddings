import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCurrentSuperAdmin } from "@/lib/security/auth";

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
