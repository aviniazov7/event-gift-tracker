import { useState } from "react";
import { eventTypeOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";
import Select from "./Select.jsx";
import DatePicker from "./DatePicker.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({ title: "", type: "wedding", event_date: today() });

// Inline "אירוע חדש" quick-create on the home screen (title, type, date).
export default function EventQuickCreate({ onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = form.title.trim() && form.event_date && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        title: form.title.trim(),
        type: form.type,
        event_date: form.event_date,
        is_mine: false,
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
      className="space-y-4 rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-sm dark:border-white/10"
    >
      <h3 className="text-base font-semibold tracking-tight">אירוע חדש</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="כותרת">
          <input
            className={fieldClasses}
            type="text"
            placeholder="לדוגמה: החתונה של נועה"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>

        <Field label="סוג">
          <Select
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
            options={eventTypeOptions.map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Field>

        <Field label="תאריך">
          <DatePicker
            value={form.event_date}
            onChange={(iso) => setForm({ ...form, event_date: iso })}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        {submitting ? "מוסיף…" : "הוסף אירוע"}
      </button>
    </form>
  );
}
