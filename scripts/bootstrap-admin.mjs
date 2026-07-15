import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DEMO_ADMIN_EMAIL;
const password = process.env.DEMO_ADMIN_PASSWORD;
if (!url || !key || !email || !password) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_ADMIN_EMAIL, and DEMO_ADMIN_PASSWORD.");
if (password.length < 12) throw new Error("DEMO_ADMIN_PASSWORD must contain at least 12 characters.");
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: users, error: listError } = await admin.auth.admin.listUsers();
if (listError) throw listError;
let user = users.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  user = data.user;
}
const { error: profileError } = await admin.from("profiles").upsert({ id: user.id, full_name: "Platform Owner", platform_role: "super_admin" });
if (profileError) throw profileError;
process.stdout.write(`Super administrator ready: ${email}\n`);
