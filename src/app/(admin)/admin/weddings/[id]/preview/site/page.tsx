import { notFound } from "next/navigation";
import { WeddingSiteRenderer } from "@/components/wedding/wedding-site";
import { getPreviewWedding } from "@/features/weddings/repository";
export const dynamic="force-dynamic";
export default async function DraftPreviewSite({params}:{params:Promise<{id:string}>}){const {id}=await params;const wedding=await getPreviewWedding(id);if(!wedding)notFound();return <WeddingSiteRenderer wedding={wedding} preview/>}
