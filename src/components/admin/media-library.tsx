"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileAudio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MediaItem = { id: string; purpose: string; mimeType: string; altText: string; byteSize: number };

const purposeLabels: Record<string, string> = {
  hero: "Hero image", portrait: "Couple portrait", gallery: "Gallery image",
  wedding_party: "Wedding party image", texture: "Background texture", music: "Background music",
};

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string>();
  const [message, setMessage] = useState("");

  async function remove(item: MediaItem) {
    if (!window.confirm(`Remove this ${purposeLabels[item.purpose]?.toLowerCase() ?? "file"}? This cannot be undone.`)) return;
    setRemoving(item.id); setMessage("");
    try {
      const response = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Media could not be removed");
      setMessage("Media removed."); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Media could not be removed");
    } finally { setRemoving(undefined); }
  }

  if (!items.length) return <p className="muted">No uploaded media yet.</p>;
  return <section className="media-library" aria-labelledby="media-library-title">
    <div className="media-library-heading"><div><p className="eyebrow">Current files</p><h3 id="media-library-title">Uploaded media</h3></div><span>{items.length} file{items.length === 1 ? "" : "s"}</span></div>
    <div className="media-library-grid">{items.map((item) => <article className="media-library-item" key={item.id}>
      <div className="media-library-preview">{item.mimeType.startsWith("image/") ? <Image src={`/api/media/${item.id}`} alt={item.altText || "Uploaded wedding media"} width={360} height={220} sizes="(max-width: 640px) 100vw, 240px" unoptimized/> : <FileAudio aria-hidden="true"/>}</div>
      <div className="media-library-copy"><strong>{purposeLabels[item.purpose] ?? item.purpose}</strong><small>{item.altText || item.mimeType} · {(item.byteSize / 1024 / 1024).toFixed(1)} MB</small></div>
      <Button type="button" variant="danger" size="sm" disabled={removing === item.id} onClick={() => remove(item)}><Trash2 size={15}/>{removing === item.id ? "Removing…" : "Remove"}</Button>
    </article>)}</div>
    {message && <p className="form-message" aria-live="polite">{message}</p>}
  </section>;
}
