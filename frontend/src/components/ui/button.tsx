import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:border-[#5BE584] focus-visible:ring-2 focus-visible:ring-[#5BE584]/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[#EF4444] aria-invalid:ring-2 aria-invalid:ring-[#EF4444]/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#5BE584] text-[#090B0F] hover:bg-[#49D472] shadow-xs",
        outline:
          "border-[#2A3039] bg-[#13171D] text-[#F8FAFC] hover:bg-[#1B2028] hover:border-[#38414D] aria-expanded:bg-[#1B2028]",
        secondary:
          "border-[#2A3039] bg-[#1B2028] text-[#F8FAFC] hover:bg-[#232A34] aria-expanded:bg-[#232A34]",
        ghost:
          "text-[#94A3B8] hover:bg-[#1B2028] hover:text-[#F8FAFC] aria-expanded:bg-[#1B2028] aria-expanded:text-[#F8FAFC]",
        destructive:
          "border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/30",
        link: "text-[#5BE584] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-7 gap-1 rounded-[10px] px-2.5 text-xs font-medium [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-[12px] px-3 text-xs font-semibold [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-[14px] px-5 text-sm font-semibold",
        icon: "size-10 rounded-[14px]",
        "icon-xs": "size-7 rounded-[10px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-[12px]",
        "icon-lg": "size-11 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
