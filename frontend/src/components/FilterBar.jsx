import { directionOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";

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
  const hasActive = Object.values(filters).some((v) => v !== "");

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
          <select
            className={fieldClasses}
            value={filters.direction}
            onChange={set("direction")}
          >
            <option value="">הכול</option>
            {directionOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="אדם">
          <select
            className={fieldClasses}
            value={filters.person_id}
            onChange={set("person_id")}
          >
            <option value="">כל האנשים</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="אירוע">
          <select
            className={fieldClasses}
            value={filters.event_id}
            onChange={set("event_id")}
          >
            <option value="">כל האירועים</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
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
