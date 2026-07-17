"use client";

import { useState } from "react";
import { CalendarDays, LockKeyhole, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TimelineEditorItem = { id: string; occurredOn: string; title: string; description: string };

export function TimelineEditor({ initial, enabled }: { initial: TimelineEditorItem[]; enabled: boolean }) {
  const [items, setItems] = useState(initial);
  function addItem() { setItems((current) => [...current, { id: crypto.randomUUID(), occurredOn: "", title: "", description: "" }]); }
  function update(id: string, changes: Partial<TimelineEditorItem>) { setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item)); }
  function remove(id: string) { setItems((current) => current.filter((item) => item.id !== id)); }
  return <fieldset className="timeline-editor span-2">
    <legend className="sr-only">Relationship timeline</legend>
    <input type="hidden" name="timelineItems" value={JSON.stringify(items.map(({ occurredOn, title, description }) => ({ occurredOn, title, description })))} />
    <div className="structured-editor-heading">
      <div><span className="structured-icon"><CalendarDays /></span><div><h3>Relationship timeline</h3><p>Add important moments such as when you met, the proposal, or another chapter in your story.</p></div></div>
      {enabled ? <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus />Add moment</Button> : <span className="locked"><LockKeyhole />Bespoke package</span>}
    </div>
    {!enabled && <p className="entitlement-note">Relationship Timeline is a Bespoke feature. Existing entries are preserved if the wedding is downgraded.</p>}
    {enabled && !items.length && <div className="structured-empty"><CalendarDays /><strong>No timeline moments yet</strong><p>Choose “Add moment” to create the first chapter.</p></div>}
    {enabled && <div className="timeline-editor-list">{items.map((item, index) => <article key={item.id} className="timeline-editor-item">
      <div className="timeline-item-number"><span>{String(index + 1).padStart(2, "0")}</span><button type="button" aria-label={`Remove timeline moment ${index + 1}`} onClick={() => remove(item.id)}><Trash2 /></button></div>
      <label className="field"><span>Date</span><input type="date" value={item.occurredOn} required onChange={(event) => update(item.id, { occurredOn: event.target.value })} /></label>
      <label className="field"><span>Moment title</span><input value={item.title} maxLength={160} required placeholder="For example: The proposal" onChange={(event) => update(item.id, { title: event.target.value })} /></label>
      <label className="field timeline-details"><span>Details</span><textarea rows={3} value={item.description} maxLength={2000} placeholder="Tell guests what made this moment special…" onChange={(event) => update(item.id, { description: event.target.value })} /></label>
    </article>)}</div>}
  </fieldset>;
}
