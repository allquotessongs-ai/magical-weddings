import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, hint, error, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return <label className={cn("field", className)}><span>{label}</span><input {...props} />{hint && <small>{hint}</small>}{error && <small className="error">{error}</small>}</label>;
}
export function TextareaField({ label, hint, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return <label className={cn("field", className)}><span>{label}</span><textarea rows={5} {...props} />{hint && <small>{hint}</small>}</label>;
}
export function SelectField({ label, children, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className={cn("field", className)}><span>{label}</span><select {...props}>{children}</select></label>;
}
