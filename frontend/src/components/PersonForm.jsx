import { useState } from "react";
import { relationOptions } from "../utils/labels.js";
import { Field, fieldClasses } from "./FormField.jsx";

const emptyForm = () => ({ full_name: "", relation: "friend", notes: "" });

export default function PersonForm({ onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const canSubmit = form.full_name.trim() && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        full_name: form.full_name.trim(),
        relation: form.relation, // English enum value
        notes: form.notes.trim() || null,
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
      <h3 className="text-base font-semibold tracking-tight">אדם חדש</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="שם">
          <input
            className={fieldClasses}
            type="text"
            placeholder="שם מלא"
            value={form.full_name}
            onChange={set("full_name")}
            required
          />
        </Field>

        <Field label="קשר">
          <select
            className={fieldClasses}
            value={form.relation}
            onChange={set("relation")}
          >
            {relationOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="הערות (לא חובה)">
            <input
              className={fieldClasses}
              type="text"
              placeholder="לדוגמה: בן דוד מצד אמא"
              value={form.notes}
              onChange={set("notes")}
            />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        {submitting ? "מוסיף…" : "הוסף אדם"}
      </button>
    </form>
  );
}
