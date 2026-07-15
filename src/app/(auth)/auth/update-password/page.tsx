import { updatePassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
export const dynamic = "force-dynamic";
export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const params=await searchParams; return <main className="centered-page"><div className="auth-form standalone"><p className="eyebrow">Choose a new password</p><h1>Secure your account</h1>{params.error && <p className="alert error">{params.error}</p>}<form action={updatePassword}><Field label="New password" hint="At least 12 characters" name="password" type="password" minLength={12} autoComplete="new-password" required/><Button type="submit">Update password</Button></form></div></main>; }
