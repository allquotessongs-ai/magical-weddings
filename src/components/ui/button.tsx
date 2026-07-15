import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("button", { variants: { variant: { default: "button-primary", outline: "button-outline", ghost: "button-ghost", danger: "button-danger" }, size: { default: "button-md", sm: "button-sm", lg: "button-lg" } }, defaultVariants: { variant: "default", size: "default" } });

export function Button({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function buttonClass({ variant = "default", size = "default", className }: VariantProps<typeof buttonVariants> & { className?: string } = {}) {
  return cn(buttonVariants({ variant, size }), className);
}
