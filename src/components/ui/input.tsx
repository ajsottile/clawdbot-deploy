"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-4 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[hsl(var(--destructive))]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
