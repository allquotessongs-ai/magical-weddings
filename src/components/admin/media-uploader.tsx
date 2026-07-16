"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

type Purpose = "hero" | "portrait" | "gallery" | "wedding_party" | "texture" | "music";

export function MediaUploader({ weddingId, purpose, title, accept }: { weddingId: string; purpose: Purpose; title: string; accept: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [focalX, setFocalX] = useState(50);
  const [focalY, setFocalY] = useState(22);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function clearSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelected(undefined); setPreviewUrl(""); setAltText(""); setFocalX(50); setFocalY(22);
    if (input.current) input.current.value = "";
  }

  function choose(file: File) {
    setMessage("");
    if (purpose === "music") { void upload(file, "", 50, 50); return; }
    setSelected(file); setPreviewUrl(URL.createObjectURL(file));
  }

  async function upload(file: File, description: string, x: number, y: number) {
    if (purpose !== "music" && !description.trim()) { setMessage("Add image alt text before uploading."); return; }
    setState("uploading"); setMessage("");
    try {
      const prepared = await fetch("/api/media/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId, purpose, fileName: file.name, mimeType: file.type, size: file.size, altText: description, focalX: x, focalY: y }) });
      const payload = await prepared.json();
      if (!prepared.ok) throw new Error(payload.error);
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.storage.from("wedding-media").uploadToSignedUrl(payload.path, payload.token, file, { contentType: file.type });
      if (error) throw error;
      const finalized = await fetch("/api/media/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await finalized.json();
      if (!finalized.ok) throw new Error(result.error);
      setState("done"); setMessage("Upload complete. This change is staged until you publish."); clearSelection(); router.refresh();
    } catch (error) { setState("idle"); setMessage(error instanceof Error ? error.message : "Upload failed"); }
  }

  return <div className="upload-card">
    <div><strong>{title}</strong><p className="muted">{purpose === "music" ? "MP3, M4A or OGG · up to 15 MB" : "JPEG, PNG, WebP or AVIF · up to 12 MB"}</p></div>
    <input ref={input} className="sr-only" type="file" accept={accept} onChange={(event) => event.target.files?.[0] && choose(event.target.files[0])}/>
    <Button type="button" variant="outline" disabled={state === "uploading"} onClick={() => input.current?.click()}><UploadCloud size={16}/>{state === "uploading" ? "Uploading…" : "Choose file"}</Button>
    {message && <p className="form-message" aria-live="polite">{message}</p>}
    {selected && previewUrl && <div className="media-adjuster-backdrop" role="presentation">
      <section className="media-adjuster" role="dialog" aria-modal="true" aria-labelledby={`adjust-${purpose}`}>
        <div className="media-adjuster-heading"><div><p className="eyebrow">Position before upload</p><h2 id={`adjust-${purpose}`}>Adjust {title.toLowerCase()}</h2></div><button type="button" aria-label="Cancel upload" onClick={clearSelection}><X/></button></div>
        <div className="media-adjuster-preview"><Image src={previewUrl} alt="Upload crop preview" fill sizes="(max-width: 780px) 100vw, 780px" style={{ objectPosition: `${focalX}% ${focalY}%` }} unoptimized/><span className="focal-marker" style={{ left: `${focalX}%`, top: `${focalY}%` }} aria-hidden="true"/></div>
        <p className="muted">Move the sliders until faces are comfortably inside the frame. The original file is retained; this controls how the site positions it.</p>
        <div className="media-adjuster-controls"><label>Horizontal position <input type="range" min="0" max="100" value={focalX} onChange={(event)=>setFocalX(Number(event.target.value))}/></label><label>Vertical position <input type="range" min="0" max="100" value={focalY} onChange={(event)=>setFocalY(Number(event.target.value))}/></label></div>
        <label className="field"><span>Image description for screen readers</span><input value={altText} maxLength={240} onChange={(event)=>setAltText(event.target.value)} placeholder="Describe the couple and setting"/></label>
        <div className="media-adjuster-actions"><Button type="button" variant="outline" onClick={clearSelection}>Cancel</Button><Button type="button" disabled={state === "uploading" || !altText.trim()} onClick={()=>upload(selected,altText,focalX,focalY)}>{state === "uploading" ? "Uploading…" : "Confirm upload"}</Button></div>
      </section>
    </div>}
  </div>;
}
