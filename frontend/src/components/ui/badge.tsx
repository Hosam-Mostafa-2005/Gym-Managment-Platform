import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-[#5BE584] focus-visible:ring-2 focus-visible:ring-[#5BE584]/30 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#5BE584]/15 text-[#5BE584] border-[#5BE584]/30",
        secondary:
          "bg-[#1B2028] text-[#F8FAFC] border-[#2A3039]",
        success:
          "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
        warning:
          "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
        destructive:
          "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
        outline:
          "border-[#2A3039] bg-transparent text-[#94A3B8]",
        ghost:
          "text-[#94A3B8] hover:bg-[#1B2028] hover:text-[#F8FAFC]",
        link: "text-[#5BE584] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
