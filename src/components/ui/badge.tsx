import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Variantes Mbàmbulaan (référentiel D9) — fond plein, pas les
        // pastels par défaut de shadcn : un badge de statut critique ou
        // de priorité doit se voir immédiatement, pas se fondre dans un
        // gris/ambre clair. Couleurs verrouillées, mêmes valeurs que
        // TensionGlyph/glyphBorderColor à travers Institution,
        // Coordinateur et Situation Room.
        marine:
          "border-transparent bg-[#0b1a2a] text-white [a&]:hover:bg-[#0b1a2a]/90",
        terracotta:
          "border-transparent bg-[#b6522f] text-white [a&]:hover:bg-[#b6522f]/90",
        amber:
          "border-transparent bg-[#c68a2c] text-white [a&]:hover:bg-[#c68a2c]/90",
        success:
          "border-transparent bg-[#1d8a5f] text-white [a&]:hover:bg-[#1d8a5f]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
