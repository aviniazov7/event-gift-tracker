import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";

function ChevronIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 group-data-[selected]:opacity-100 dark:text-emerald-400"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Styled, accessible replacement for a native <select>. Same contract as a
// controlled input: `value` plus `onChange(newValue)`. Options are
// [{ value, label }]. RTL- and dark-mode-aware to match the form inputs.
export default function Select({ value, onChange, options, placeholder }) {
  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-right text-sm text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-white/15 dark:bg-night dark:text-ink dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25">
          <span className={`truncate ${selected ? "" : "text-muted"}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronIcon />
        </ListboxButton>

        <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-black/10 bg-card py-1 text-sm shadow-lg focus:outline-none dark:border-white/15">
          {options.map((o) => (
            <ListboxOption
              key={String(o.value)}
              value={o.value}
              className="group flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-ink data-[focus]:bg-emerald-50 data-[focus]:text-emerald-700 dark:data-[focus]:bg-emerald-500/15 dark:data-[focus]:text-emerald-300"
            >
              <span className="truncate">{o.label}</span>
              <CheckIcon />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
