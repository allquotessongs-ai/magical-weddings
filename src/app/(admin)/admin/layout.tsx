import Link from "next/link";
import { HeartHandshake, LayoutDashboard, LogOut, Plus, Settings, UsersRound } from "lucide-react";
import { requireSuperAdmin } from "@/lib/security/auth";
import { signOut } from "@/features/auth/actions";
import { Button, buttonClass } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin"><span>MW</span><strong>Magical Weddings</strong></Link><nav><Link href="/admin"><LayoutDashboard/>Overview</Link><Link href="/admin/weddings"><HeartHandshake/>Weddings</Link><span aria-disabled="true"><UsersRound/>Guests <small>V2</small></span><span aria-disabled="true"><Settings/>Settings</span></nav><Link className={buttonClass({ size: "sm" })} href="/admin/weddings/new"><Plus size={16}/>New wedding</Link><div className="admin-user"><div><strong>{admin.name}</strong><small>{admin.email}</small></div><form action={signOut}><Button variant="ghost" size="sm" aria-label="Sign out"><LogOut size={17}/></Button></form></div></aside><div className="admin-main">{children}</div></div>;
}
