import Link from "next/link";
import { Check } from "lucide-react";
import { WIZARD_STEPS } from "@/lib/config/brand";

export function WizardNav({ weddingId, current }: { weddingId: string; current: string }) {
  const currentIndex = WIZARD_STEPS.findIndex((step) => step.slug === current);
  return <nav className="wizard-nav" aria-label="Wedding creation steps">{WIZARD_STEPS.map((step,index)=><Link key={step.slug} className={index === currentIndex ? "active" : index < currentIndex ? "complete" : ""} href={`/admin/weddings/${weddingId}/edit/${step.slug}`}><span>{index < currentIndex ? <Check/> : step.id}</span><small>{step.label}</small></Link>)}</nav>;
}
