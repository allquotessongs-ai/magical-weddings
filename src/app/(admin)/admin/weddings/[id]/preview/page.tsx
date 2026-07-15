import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { getAdminWedding } from "@/features/weddings/repository";

export const dynamic="force-dynamic";
export default async function PreviewPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const raw=await getAdminWedding(id);const names=String(raw.display_names);return <main className="preview-page"><header><Link className={buttonClass({variant:"ghost",size:"sm"})} href={`/admin/weddings/${id}/edit/publish`}><ArrowLeft/>Back to editor</Link><div><strong>{names}</strong><span>Responsive preview</span></div></header><div className="preview-grid"><Preview id={id} title="Mobile" width={390}/><Preview id={id} title="Tablet" width={768}/><Preview id={id} title="Desktop" width={1280}/></div><p className="preview-note">Each frame uses the saved draft and the same renderer as the public wedding URL.</p></main>}
function Preview({id,title,width}:{id:string;title:string;width:number}){return <section style={{maxWidth:width}}><span>{title} · {width}px</span><iframe title={`${title} preview`} src={`/admin/weddings/${id}/preview/site`}/></section>}
