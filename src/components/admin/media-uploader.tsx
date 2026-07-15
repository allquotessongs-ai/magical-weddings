"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function MediaUploader({ weddingId, purpose, title, accept }: { weddingId: string; purpose: "hero" | "portrait" | "gallery" | "wedding_party" | "texture" | "music"; title: string; accept: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
  const [message, setMessage] = useState("");
  async function upload(file: File) {
    setState("uploading"); setMessage("");
    try {
      const altText = purpose === "music" ? "" : window.prompt("Describe this image for guests using screen readers:", "") ?? "";
      const prepared = await fetch("/api/media/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weddingId, purpose, fileName: file.name, mimeType: file.type, size: file.size, altText }) });
      const payload = await prepared.json();
      if (!prepared.ok) throw new Error(payload.error);
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.storage.from("wedding-media").uploadToSignedUrl(payload.path, payload.token, file, { contentType: file.type });
      if (error) throw error;
      const finalized = await fetch("/api/media/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await finalized.json();
      if (!finalized.ok) throw new Error(result.error);
      setState("done"); setMessage("Upload complete. Refresh preview to see the change.");
    } catch (error) { setState("idle"); setMessage(error instanceof Error ? error.message : "Upload failed"); }
  }
  return <div className="upload-card">
    <div><strong>{title}</strong><p className="muted">{purpose === "music" ? "MP3, M4A or OGG · up to 15 MB" : "JPEG, PNG, WebP or AVIF · up to 12 MB"}</p></div>
    <input ref={input} className="sr-only" type="file" accept={accept} onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} />
    <Button type="button" variant="outline" disabled={state === "uploading"} onClick={() => input.current?.click()}><UploadCloud size={16} /> {state === "uploading" ? "Uploading…" : "Choose file"}</Button>
    {message && <p className="form-message" aria-live="polite">{message}</p>}
  </div>;
}
