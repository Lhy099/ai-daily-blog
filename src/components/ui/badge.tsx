import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "border-transparent bg-cyan-600 text-white": variant === "default",
          "border-transparent bg-slate-800 text-slate-300": variant === "secondary",
          "border-slate-700 text-slate-400": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
