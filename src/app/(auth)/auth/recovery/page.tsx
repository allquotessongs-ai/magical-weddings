import Link from "next/link";
import { requestPasswordRecovery } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
export const dynamic = "force-dynamic";
export default function RecoveryPage() { return <main className="centered-page"><div className="auth-form standalone"><p className="eyebrow">Account recovery</p><h1>Reset your password</h1><p className="muted">We will email a secure, single-use recovery link if the account exists.</p><form action={requestPasswordRecovery}><Field label="Email address" name="email" type="email" required/><Button type="submit">Send recovery link</Button></form><Link className="text-link" href="/login">Return to sign in</Link></div></main>; }
