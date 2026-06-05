import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Plus } from "lucide-react";
import { fieldClasses } from "./FormField.jsx";

const CREATE = "__create__";

// Person picker for the unified quick-add flow. Filters existing people as you
// type and, when there's no exact match, offers to use the typed name as a NEW
// person. Nothing is created here — the new name is just captured and the
// single POST /quick-add does the find-or-create.
//
// `value` is { id, name } | null (id is null for a not-yet-created person);
// `onChange` receives the same { id, name } shape (or null when cleared).
export default function PersonCombobox({ persons, value, onChange }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered =
    q === ""
      ? persons
      : persons.filter((p) => p.full_name.toLowerCase().includes(q));
  const exactMatch = persons.some(
    (p) => p.full_name.trim().toLowerCase() === q,
  );
  const canCreate = q !== "" && !exactMatch;

  function handleChange(val) {
    if (val === CREATE) {
      onChange({ id: null, name: query.trim() });
    } else {
      const p = persons.find((x) => String(x.id) === String(val));
      onChange(p ? { id: p.id, name: p.full_name } : null);
    }
    setQuery("");
  }

  // Headless UI passes the Combobox `value` (a key string) to displayValue; we
  // ignore it and render our object's name — the picked person or typed name.
  const selectedKey =
    value?.id != null ? String(value.id) : value?.name ? CREATE : "";

  return (
    <Combobox value={selectedKey} onChange={handleChange} immediate>
      <div className="relative">
        <ComboboxInput
          className={fieldClasses}
          placeholder="בחר או הוסף אדם…"
          displayValue={() => value?.name ?? ""}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-black/10 bg-card py-1 text-sm shadow-lg focus:outline-none dark:border-white/15">
          {filtered.map((p) => (
            <ComboboxOption
              key={p.id}
              value={String(p.id)}
              className="flex cursor-pointer items-center px-3 py-2 text-ink data-[focus]:bg-emerald-50 data-[focus]:text-emerald-700 dark:data-[focus]:bg-emerald-500/15 dark:data-[focus]:text-emerald-300"
            >
              <span className="truncate">{p.full_name}</span>
            </ComboboxOption>
          ))}

          {canCreate && (
            <ComboboxOption
              value={CREATE}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-2 font-medium text-emerald-700 data-[focus]:bg-emerald-50 dark:text-emerald-300 dark:data-[focus]:bg-emerald-500/15"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">הוסף ‘{query.trim()}’</span>
            </ComboboxOption>
          )}

          {filtered.length === 0 && !canCreate && (
            <div className="px-3 py-2 text-muted">אין תוצאות</div>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
