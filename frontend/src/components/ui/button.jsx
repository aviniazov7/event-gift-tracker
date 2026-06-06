import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

// shadcn-style button, themed to GiftLedger. The `glow` variant powers the
// landing CTA; all variants carry the shared focus-ring + press feedback.
const buttonVariants = cva(
  "focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
        glow: "bg-emerald-600 text-white shadow-[0_10px_40px_-8px_rgba(16,185,129,0.55)] hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
        outline:
          "border border-black/10 text-ink hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10",
        ghost: "text-ink hover:bg-black/5 dark:hover:bg-white/10",
      },
      size: {
        default: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
