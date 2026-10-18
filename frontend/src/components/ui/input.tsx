import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[14px] border border-[#2A3039] bg-[#13171D] px-3.5 py-2 text-sm text-[#F8FAFC] transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#F8FAFC] placeholder:text-[#94A3B8]/60 hover:border-[#38414D] focus-visible:border-[#5BE584] focus-visible:ring-1 focus-visible:ring-[#5BE584] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#13171D]/50 disabled:opacity-50 aria-invalid:border-[#EF4444] aria-invalid:ring-1 aria-invalid:ring-[#EF4444]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
