import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { fieldClasses } from "./FormField.jsx";

const CREATE = "__create__";

// A person picker that filters existing people as you type and, when there is
// no exact match, offers to create the typed name on the fly (POST /persons).
// `value` is the selected person id (string); `onChange` receives the id.
export default function PersonCombobox({
  persons,
  value,
  onChange,
  onCreatePerson,
}) {
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

  async function handleChange(val) {
    if (val === CREATE) {
      const person = await onCreatePerson(query.trim());
      if (person) onChange(String(person.id));
    } else {
      onChange(val);
    }
    setQuery("");
  }

  return (
    <Combobox value={value} onChange={handleChange} immediate>
      <div className="relative">
        <ComboboxInput
          className={fieldClasses}
          placeholder="בחר או הוסף אדם…"
          displayValue={(val) => {
            const p = persons.find((x) => String(x.id) === String(val));
            return p ? p.full_name : "";
          }}
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
              className="flex cursor-pointer items-center px-3 py-2 font-medium text-emerald-700 data-[focus]:bg-emerald-50 dark:text-emerald-300 dark:data-[focus]:bg-emerald-500/15"
            >
              ➕ הוסף ‘{query.trim()}’
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
