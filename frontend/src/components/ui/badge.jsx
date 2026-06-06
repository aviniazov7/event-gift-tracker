import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

// shadcn-style badge, themed to GiftLedger (emerald accent, dark/light aware).
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-600 text-white dark:bg-emerald-500",
        soft: "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        outline: "border-black/10 text-muted dark:border-white/15",
      },
    },
    defaultVariants: { variant: "soft" },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
