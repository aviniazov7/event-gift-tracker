import { useState } from "react";
import { eventTypeOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  title: "",
  type: "wedding",
  event_date: today(),
  is_mine: false,
});

export default function EventForm({ onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const canSubmit = form.title.trim() && form.event_date && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        title: form.title.trim(),
        type: form.type, // English enum value
        event_date: form.event_date,
        is_mine: form.is_mine,
      });
      setForm(emptyForm());
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
      <h3 className="text-base font-semibold tracking-tight">אירוע חדש</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="כותרת">
          <input
            className={fieldClasses}
            type="text"
            placeholder="לדוגמה: החתונה של נועה"
            value={form.title}
            onChange={set("title")}
            required
          />
        </Field>

        <Field label="סוג">
          <select
            className={fieldClasses}
            value={form.type}
            onChange={set("type")}
          >
            {eventTypeOptions.map(([value, label]) => (
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
            value={form.event_date}
            onChange={set("event_date")}
            required
          />
        </Field>

        <label className="flex items-center gap-2 self-end py-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-black/20 text-emerald-600 focus:ring-emerald-200"
            checked={form.is_mine}
            onChange={(e) => setForm({ ...form, is_mine: e.target.checked })}
          />
          <span className="text-sm text-ink">האירוע שלי</span>
        </label>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "מוסיף…" : "הוסף אירוע"}
      </button>
    </form>
  );
}
