import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingSiteRenderer } from "@/components/wedding/wedding-site";
import { getPublicWedding } from "@/features/weddings/repository";
import { absoluteUrl, formatWeddingDate } from "@/lib/utils";

export const revalidate = 300;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const wedding=await getPublicWedding(slug);if(!wedding)return{};const description=`You’re invited to celebrate ${wedding.displayNames} on ${formatWeddingDate(wedding.weddingAt,wedding.timezone)}.`;const image=wedding.media.hero?absoluteUrl(`/api/media/${wedding.media.hero}`):undefined;return {title:wedding.displayNames,description,alternates:{canonical:absoluteUrl(`/${slug}`)},openGraph:{title:wedding.displayNames,description,type:"website",images:image?[{url:image}]:undefined},twitter:{card:"summary_large_image",title:wedding.displayNames,description,images:image?[image]:undefined}}}
export default async function PublicWeddingPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const wedding=await getPublicWedding(slug);if(!wedding)notFound();return <WeddingSiteRenderer wedding={wedding}/>}
