"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="centered-page"><div className="error-panel"><p className="eyebrow">Something went wrong</p><h1>We could not finish that request.</h1><p>Please try again. Your saved wedding details are safe.</p><Button onClick={reset}>Try again</Button></div></main>;
}
