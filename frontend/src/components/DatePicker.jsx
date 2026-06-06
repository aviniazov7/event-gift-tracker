import { useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { DayPicker } from "react-day-picker";
import Select from "./Select.jsx";
import { formatDate } from "../utils/dates.js";

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

// Display formatting (ISO -> DD/MM/YYYY) is the shared helper; parsing typed
// input back to ISO (validating real dates) is local to the picker.
function parseTyped(text) {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const d = Number(match[1]);
  const mo = Number(match[2]);
  const y = Number(match[3]);
  const date = new Date(y, mo - 1, d);
  // Reject impossible dates (e.g. 31/02/2026 rolls over to March).
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return toISO(date);
}

// Hebrew month + weekday names for the calendar (no date-fns dependency).
const heMonth = new Intl.DateTimeFormat("he-IL", { month: "long" });
const heWeekday = new Intl.DateTimeFormat("he-IL", { weekday: "narrow" });
const FORMATTERS = {
  formatMonthDropdown: (date) => heMonth.format(date),
  formatWeekdayName: (date) => heWeekday.format(date),
};

// Replace react-day-picker's native <select> month/year dropdowns with the
// app's themed Headless UI Select, so the navigation matches the brand (dark
// surface, emerald selected state, RTL, rounded, focus ring) instead of showing
// OS-native styling. rdp passes a select-style onChange, so we adapt the Select's
// value-based onChange into a synthetic { target: { value } } event.
function CalendarDropdown({ options = [], value, onChange, "aria-label": ariaLabel }) {
  const selectOptions = options
    .filter((o) => !o.disabled)
    .map((o) => ({ value: o.value, label: o.label }));
  // Years are numeric (short) → compact width; months get a wider fixed width so
  // longer Hebrew names (ספטמבר, אוקטובר…) aren't truncated.
  const isYear = selectOptions.every((o) => /^\d+$/.test(String(o.label)));
  return (
    <div className={isYear ? "w-24 shrink-0" : "w-32 shrink-0"}>
      <Select
        value={value}
        onChange={(next) => onChange?.({ target: { value: String(next) } })}
        options={selectOptions}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

const DAYPICKER_COMPONENTS = { Dropdown: CalendarDropdown };

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

// A date field you can TYPE (DD/MM/YYYY) or pick from the calendar. The calendar
// icon opens a popover with month + year dropdowns for fast far-date navigation.
// onChange always emits ISO (YYYY-MM-DD).
export default function DatePicker({ value, onChange, placeholder = "DD/MM/YYYY" }) {
  const selected = parseISO(value);
  const [text, setText] = useState(formatDate(value));

  // Keep the input text in sync when the value changes from outside (a calendar
  // pick, or the form resetting after submit).
  useEffect(() => {
    setText(formatDate(value));
  }, [value]);

  function handleType(next) {
    setText(next);
    // Push upward only once a complete, valid date is typed; clearing empties it.
    if (next.trim() === "") onChange("");
    else {
      const iso = parseTyped(next);
      if (iso) onChange(iso);
    }
  }

  function handleBlur() {
    if (text.trim() === "") return;
    // On blur, snap back to the last valid value if what's typed isn't a date.
    if (!parseTyped(text)) setText(formatDate(value));
  }

  // Bound the year dropdown to a useful range around today.
  const now = new Date();
  const startMonth = new Date(now.getFullYear() - 20, 0);
  const endMonth = new Date(now.getFullYear() + 5, 11);

  return (
    <Popover className="relative">
      <div className="box-border flex w-full max-w-full items-center gap-1 rounded-xl border border-black/10 bg-white pr-3 text-sm text-ink focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 dark:border-white/15 dark:bg-night dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-500/25">
        <input
          type="text"
          inputMode="numeric"
          value={text}
          placeholder={placeholder}
          onChange={(e) => handleType(e.target.value)}
          onBlur={handleBlur}
          aria-label="תאריך (יום/חודש/שנה)"
          className="min-w-0 flex-1 bg-transparent py-2 tabular-nums text-ink outline-none placeholder:text-muted"
        />
        <PopoverButton
          aria-label="פתח לוח שנה"
          title="פתח לוח שנה"
          className="focus-ring -ml-1 shrink-0 cursor-pointer rounded-lg p-1.5 text-muted transition-colors duration-200 hover:text-ink"
        >
          <CalendarIcon />
        </PopoverButton>
      </div>

      <PopoverPanel
        anchor={{ to: "bottom start", gap: 8 }}
        className="z-30 w-auto max-w-[calc(100vw-1.5rem)] overflow-visible rounded-2xl border border-black/10 bg-card p-3 text-ink shadow-lg focus:outline-none dark:border-white/15"
      >
        {({ close }) => (
          <DayPicker
            mode="single"
            dir="rtl"
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            formatters={FORMATTERS}
            components={DAYPICKER_COMPONENTS}
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
