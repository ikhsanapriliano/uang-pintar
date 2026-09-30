import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "yellow"
    | "green"
    | "blue";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-white hover:bg-destructive/80",
    outline: "text-foreground border-border",
    yellow:
      "border-transparent bg-yellow-400 text-white hover:bg-yellow-400/80",
    green: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
    blue: "border-blue-500/30 bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
