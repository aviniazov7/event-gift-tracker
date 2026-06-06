import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn's class combiner: merges conditional classes and de-dupes conflicting
// Tailwind utilities (last one wins). Kept under utils/ — not lib/ — because the
// repo .gitignore ignores any lib/ directory.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
