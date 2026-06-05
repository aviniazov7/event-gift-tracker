import { Minus, Plus } from "lucide-react";
import { fieldClasses } from "./FormField.jsx";

// Styled amount stepper that replaces the native number spinner: emerald-accent
// − / + buttons flanking a centered, free-typeable value. Larger tap targets
// than the native arrows, tabular-nums, focus rings, RTL-aware (+ on the right).
// `value`/`onChange` are strings so the field can be genuinely empty.
export default function NumberStepper({
  value,
  onChange,
  step = 50,
  min = 0,
  placeholder = "0",
}) {
  const current = () => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };
  const setNumber = (n) =>
    onChange(String(Math.max(min, Math.round(n * 100) / 100)));

  const atMin = current() <= min;

  const button =
    "focus-ring flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white text-emerald-700 transition-colors duration-200 hover:bg-emerald-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-night dark:text-emerald-300 dark:hover:bg-emerald-500/10";

  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={() => setNumber(current() + step)}
        aria-label="הגדלת הסכום"
        className={button}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        className={`${fieldClasses} flex-1 text-center tabular-nums`}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          // Allow an empty field, or digits with up to two decimals.
          if (next === "" || /^\d*\.?\d{0,2}$/.test(next)) onChange(next);
        }}
      />

      <button
        type="button"
        onClick={() => setNumber(current() - step)}
        disabled={atMin}
        aria-label="הקטנת הסכום"
        className={button}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
