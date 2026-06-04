import { useState } from "react";
import { directionOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";
import Select from "./Select.jsx";
import PersonCombobox from "./PersonCombobox.jsx";

// Quick-add a gift to the current event: pick/create a person, choose direction
// and amount. The parent injects event_id + date and persists.
export default function QuickAddGift({ persons, onCreatePerson, onAdd }) {
  const [personId, setPersonId] = useState("");
  const [direction, setDirection] = useState("given");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = personId && amount && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onAdd({
        person_id: Number(personId),
        direction,
        amount: Number(amount),
      });
      setPersonId("");
      setAmount("");
      setDirection("given");
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
            value={personId}
            onChange={setPersonId}
            onCreatePerson={onCreatePerson}
          />
        </Field>

        <Field label="כיוון">
          <Select
            value={direction}
            onChange={setDirection}
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
