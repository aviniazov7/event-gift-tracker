import { useState } from "react";
import { directionOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  person_id: "",
  event_id: "",
  amount: "",
  direction: "given",
  date: today(),
  notes: "",
});

export default function TransactionForm({ persons, events, onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const canSubmit =
    form.person_id && form.event_id && form.amount && form.date && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Note: enum values stay English (given/received) — only labels are Hebrew.
      await onCreate({
        person_id: Number(form.person_id),
        event_id: Number(form.event_id),
        amount: Number(form.amount),
        direction: form.direction,
        date: form.date,
        notes: form.notes.trim() || null,
      });
      setForm(emptyForm()); // reset for the next entry
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-sm"
    >
      <h3 className="text-base font-semibold tracking-tight">תנועה חדשה</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="אדם">
          <select
            className={fieldClasses}
            value={form.person_id}
            onChange={set("person_id")}
            required
          >
            <option value="">בחר אדם…</option>
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
            value={form.event_id}
            onChange={set("event_id")}
            required
          >
            <option value="">בחר אירוע…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="סכום">
          <input
            className={fieldClasses}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={set("amount")}
            required
          />
        </Field>

        <Field label="כיוון">
          <select
            className={fieldClasses}
            value={form.direction}
            onChange={set("direction")}
          >
            {directionOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="תאריך">
          <input
            className={fieldClasses}
            type="date"
            value={form.date}
            onChange={set("date")}
            required
          />
        </Field>

        <Field label="הערות (לא חובה)">
          <input
            className={fieldClasses}
            type="text"
            placeholder="לדוגמה: מתנה במזומן"
            value={form.notes}
            onChange={set("notes")}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "מוסיף…" : "הוסף תנועה"}
      </button>
    </form>
  );
}
