import { Trash2 } from "lucide-react";

// Small destructive icon button used on rows/cards. Neutral by default, turns
// rose on hover/focus so it doesn't shout until the user reaches for it.
export default function DeleteButton({ onClick, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`focus-ring shrink-0 cursor-pointer rounded-xl p-2 text-muted transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400 ${className}`}
    >
      <Trash2 className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
