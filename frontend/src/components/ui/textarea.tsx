import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[14px] border border-[#2A3039] bg-[#13171D] px-3.5 py-2.5 text-sm text-[#F8FAFC] transition-colors outline-none placeholder:text-[#94A3B8]/60 hover:border-[#38414D] focus-visible:border-[#5BE584] focus-visible:ring-1 focus-visible:ring-[#5BE584] disabled:cursor-not-allowed disabled:bg-[#13171D]/50 disabled:opacity-50 aria-invalid:border-[#EF4444] aria-invalid:ring-1 aria-invalid:ring-[#EF4444]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
