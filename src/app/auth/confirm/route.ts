import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as "invite" | "recovery" | "email" | null;
  const next = request.nextUrl.searchParams.get("next") ?? "/admin";
  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/admin", request.url));
  }
  return NextResponse.redirect(new URL("/login?error=This%20sign-in%20link%20is%20invalid%20or%20expired", request.url));
}
