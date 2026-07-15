import Link from "next/link";
import { Archive, CalendarClock, Eye, FilePenLine, Globe2, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { getDashboardData } from "@/features/weddings/repository";
import { formatWeddingDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { counts, recent } = await getDashboardData();
  const cards = [ ["Total weddings",counts.total,Globe2], ["Draft",counts.draft,FilePenLine], ["Published",counts.published,Eye], ["Scheduled",counts.scheduled,CalendarClock], ["Archived",counts.archived,Archive], ["Upcoming",counts.upcoming,CalendarClock] ] as const;
  return <><PageHeader eyebrow="Platform overview" title="Your weddings, at a glance" description="Create, refine and publish every couple’s invitation from one secure workspace." actions={<Link className={buttonClass()} href="/admin/weddings/new"><Plus size={17}/>Create wedding</Link>}/><section className="stat-grid">{cards.map(([label,value,Icon])=><Card key={label} className="stat-card"><Icon/><span>{label}</span><strong>{value}</strong></Card>)}</section><section className="admin-section"><div className="section-heading"><div><h2>Recently edited</h2><p>Continue shaping your latest celebrations.</p></div><Link href="/admin/weddings">View all weddings</Link></div><Card className="recent-list">{recent.length ? recent.map((wedding)=><Link key={wedding.id} href={`/admin/weddings/${wedding.id}/edit/basics`}><span className={`status-dot ${wedding.status}`}/><div><strong>{wedding.display_names}</strong><small>{formatWeddingDate(wedding.wedding_at)}</small></div><span className="status-badge">{wedding.effectivePublished ? "published" : wedding.status}</span></Link>) : <div className="empty-state"><HeartIcon/><h3>No weddings yet</h3><p>Create your first celebration to begin.</p></div>}</Card></section></>;
}
function HeartIcon(){ return <span className="empty-heart">♡</span>; }
