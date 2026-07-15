import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
export default function NotFound() { return <main className="centered-page"><div className="error-panel"><p className="eyebrow">Invitation not found</p><h1>This celebration is not available.</h1><p>It may still be in draft, have a different address, or no longer be published.</p><Link className={buttonClass()} href="/">Visit Magical Weddings</Link></div></main>; }
