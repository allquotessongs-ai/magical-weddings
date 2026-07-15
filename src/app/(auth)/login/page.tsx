import Link from "next/link";
import { Heart } from "lucide-react";
import { signIn } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { BRAND } from "@/lib/config/brand";

export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const params = await searchParams;
  return <main className="auth-page"><section className="auth-visual"><div className="auth-quote"><Heart/><blockquote>“Where there is love, there is life.”</blockquote><p>— Mahatma Gandhi</p></div></section><section className="auth-panel"><Link className="brand-lockup" href="/"><span>MW</span>{BRAND.name}</Link><div className="auth-form"><p className="eyebrow">Platform administration</p><h1>Welcome back</h1><p className="muted">Sign in to create and manage beautiful wedding experiences.</p>{params.error && <p className="alert error" role="alert">{params.error}</p>}{params.message && <p className="alert success">{params.message}</p>}<form action={signIn}><input type="hidden" name="next" value={params.next ?? "/admin"}/><Field label="Email address" name="email" type="email" autoComplete="email" required/><Field label="Password" name="password" type="password" autoComplete="current-password" required/><Button type="submit">Sign in securely</Button></form><Link className="text-link" href="/auth/recovery">Forgot your password?</Link></div></section></main>;
}
