"use client";

import { useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LockKeyhole } from "lucide-react";
import { SECTION_LABELS } from "@/lib/config/brand";
import { Button } from "@/components/ui/button";

type Item = { key: keyof typeof SECTION_LABELS; enabled: boolean; locked: boolean };

function SortableRow({ item, onToggle }: { item: Item; onToggle: (key: string) => void }) {
  const { attributes,listeners,setNodeRef,transform,transition,isDragging }=useSortable({id:item.key});
  return <div ref={setNodeRef} className={`sort-row ${isDragging?"dragging":""}`} style={{transform:CSS.Transform.toString(transform),transition}}><button type="button" className="drag-handle" aria-label={`Move ${SECTION_LABELS[item.key]}`} {...attributes} {...listeners}><GripVertical/></button><span>{SECTION_LABELS[item.key]}</span>{item.locked ? <small className="locked"><LockKeyhole/>Higher package</small> : <label className="switch"><input type="checkbox" name={`enabled:${item.key}`} checked={item.enabled} onChange={()=>onToggle(item.key)}/><span/> {item.enabled?"Shown":"Hidden"}</label>}</div>;
}

export function SectionSorter({ initial }: { initial: Item[] }) {
  const [items,setItems]=useState(initial); const sensors=useSensors(useSensor(PointerSensor),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
  function dragEnd(event:DragEndEvent){const {active,over}=event;if(!over||active.id===over.id)return;setItems((current)=>{const oldIndex=current.findIndex(x=>x.key===active.id);const newIndex=current.findIndex(x=>x.key===over.id);return arrayMove(current,oldIndex,newIndex);});}
  return <><input type="hidden" name="order" value={JSON.stringify(items.map(x=>x.key))}/><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={items.map(x=>x.key)} strategy={verticalListSortingStrategy}><div className="sort-list">{items.map((item)=><SortableRow key={item.key} item={item} onToggle={(key)=>setItems(current=>current.map(x=>x.key===key?{...x,enabled:!x.enabled}:x))}/>)}</div></SortableContext></DndContext><div className="form-actions"><Button type="submit">Save sections & continue</Button></div></>;
}
