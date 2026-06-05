import { useState } from "react";
import { directionOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";
import Select from "./Select.jsx";
import PersonCombobox from "./PersonCombobox.jsx";

// The in-event add-row: pick/create a person + amount and add a gift to THIS
// event. Direction is owned by the parent so it stays "sticky" across entries
// (and can default to קיבלתי for the user's own event) — adding many people in
// a row becomes just name + amount each time.
export default function QuickAddGift({
  persons,
  direction,
  onDirectionChange,
  onAdd,
}) {
  const [person, setPerson] = useState(null); // { id, name } | null
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasPerson = person && (person.id != null || person.name);
  const canSubmit = hasPerson && amount && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onAdd({ person, amount: Number(amount) });
      // Reset only person + amount; keep the (sticky) direction for the next.
      setPerson(null);
      setAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-sm dark:border-white/10"
    >
      <h3 className="text-base font-semibold tracking-tight">הוספת מתנה</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="אדם">
          <PersonCombobox
            persons={persons}
            value={person}
            onChange={setPerson}
          />
        </Field>

        <Field label="כיוון">
          <Select
            value={direction}
            onChange={onDirectionChange}
            options={directionOptions.map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Field>

        <Field label="סכום">
          <input
            className={fieldClasses}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>
      </div>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        {submitting ? "מוסיף…" : "הוסף"}
      </button>
    </form>
  );
}
