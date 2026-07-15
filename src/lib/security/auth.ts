import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const getCurrentSuperAdmin = cache(async () => {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, full_name, platform_role").eq("id", user.id).maybeSingle();
  if (!profile || profile.platform_role !== "super_admin") return null;
  return { id: user.id, email: user.email ?? "", name: profile.full_name ?? "Platform owner" };
});

export async function requireSuperAdmin() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) redirect("/login?next=/admin");
  return admin;
}

export async function assertSuperAdmin() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) throw new Error("You are not authorized to perform this action.");
  return admin;
}
