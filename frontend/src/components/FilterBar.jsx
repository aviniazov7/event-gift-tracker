import { directionOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";
import Select from "./Select.jsx";

const emptyFilters = {
  direction: "",
  person_id: "",
  event_id: "",
  date_from: "",
  date_to: "",
  min_amount: "",
  max_amount: "",
};

export { emptyFilters };

export default function FilterBar({ persons, events, filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  // Select emits the value directly (not a DOM event).
  const setValue = (key) => (value) => onChange({ ...filters, [key]: value });
  const hasActive = Object.values(filters).some((v) => v !== "");

  const directionFilterOptions = [
    { value: "", label: "הכול" },
    ...directionOptions.map(([value, label]) => ({ value, label })),
  ];
  const personOptions = [
    { value: "", label: "כל האנשים" },
    ...persons.map((p) => ({ value: String(p.id), label: p.full_name })),
  ];
  const eventOptions = [
    { value: "", label: "כל האירועים" },
    ...events.map((ev) => ({ value: String(ev.id), label: ev.title })),
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">סינון</h3>
        {hasActive && (
          <button
            type="button"
            onClick={() => onChange({ ...emptyFilters })}
            className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            נקה סינון
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="כיוון">
          <Select
            value={filters.direction}
            onChange={setValue("direction")}
            options={directionFilterOptions}
          />
        </Field>

        <Field label="אדם">
          <Select
            value={filters.person_id}
            onChange={setValue("person_id")}
            options={personOptions}
          />
        </Field>

        <Field label="אירוע">
          <Select
            value={filters.event_id}
            onChange={setValue("event_id")}
            options={eventOptions}
          />
        </Field>

        <Field label="מתאריך">
          <input
            className={fieldClasses}
            type="date"
            value={filters.date_from}
            onChange={set("date_from")}
          />
        </Field>

        <Field label="עד תאריך">
          <input
            className={fieldClasses}
            type="date"
            value={filters.date_to}
            onChange={set("date_to")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="סכום מינ׳">
            <input
              className={fieldClasses}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              value={filters.min_amount}
              onChange={set("min_amount")}
            />
          </Field>
          <Field label="סכום מקס׳">
            <input
              className={fieldClasses}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="∞"
              value={filters.max_amount}
              onChange={set("max_amount")}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
