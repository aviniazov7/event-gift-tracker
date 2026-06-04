import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { DayPicker } from "react-day-picker";

// ISO (YYYY-MM-DD) <-> Date helpers. We build the Date from local parts so the
// value never shifts across timezones, and emit ISO so nothing downstream
// changes (the native input emitted the same format).
function parseISO(iso) {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Trigger shows the Israeli display format DD/MM/YYYY.
function formatDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-muted"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export default function DatePicker({ value, onChange, placeholder = "בחר תאריך" }) {
  const selected = parseISO(value);

  return (
    <Popover className="relative">
      <PopoverButton className="box-border flex w-full max-w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-right text-sm text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-white/15 dark:bg-night dark:text-ink dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25">
        <span className={value ? "" : "text-muted"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon />
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: "bottom start", gap: 8 }}
        className="z-30 w-auto max-w-[calc(100vw-1.5rem)] overflow-auto rounded-2xl border border-black/10 bg-card p-3 text-ink shadow-lg focus:outline-none dark:border-white/15"
      >
        {({ close }) => (
          <DayPicker
            mode="single"
            dir="rtl"
            selected={selected}
            defaultMonth={selected ?? new Date()}
            onSelect={(date) => {
              if (date) {
                onChange(toISO(date));
                close();
              }
            }}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
}
