import { useState } from "react";
import { directionOptions, eventTypeOptions } from "../utils/labels.js";
import { Field } from "./FormField.jsx";
import Select from "./Select.jsx";
import DatePicker from "./DatePicker.jsx";
import EventCombobox from "./EventCombobox.jsx";
import PersonCombobox from "./PersonCombobox.jsx";
import Toggle from "./Toggle.jsx";
import Spinner from "./Spinner.jsx";
import NumberStepper from "./NumberStepper.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const emptyState = () => ({
  event: null, // { id, name } — id null for a new event
  person: null, // { id, name } — id null for a new person
  newType: "wedding", // type for a brand-new event
  newIsMine: false, // "האירוע שלי" for a brand-new event
  direction: "given",
  amount: "",
  date: today(),
});

// The home screen's single "הוספה מהירה" form: one submit logs a gift end to
// end — picking/creating the event and person and recording the transaction via
// POST /quick-add. Replaces the old three-step "אירוע חדש" flow.
export default function QuickAddForm({ events, persons, onSubmit }) {
  const [form, setForm] = useState(emptyState);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Show the type + "my event" controls only while inventing a new event.
  const isNewEvent = Boolean(form.event && form.event.id == null && form.event.name);

  const hasEvent = form.event && (form.event.id != null || form.event.name);
  const hasPerson = form.person && (form.person.id != null || form.person.name);
  const canSubmit = hasEvent && hasPerson && form.amount && form.date && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const event =
        form.event.id != null
          ? { id: form.event.id }
          : {
              name: form.event.name,
              type: form.newType,
              date: form.date,
              is_mine: form.newIsMine,
            };
      const person =
        form.person.id != null
          ? { id: form.person.id }
          : { name: form.person.name };

      await onSubmit({
        event,
        person,
        direction: form.direction,
        amount: Number(form.amount),
        date: form.date,
      });
      setForm(emptyState());
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
      <h3 className="text-base font-semibold tracking-tight">הוספה מהירה</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="אירוע (שם)">
          <EventCombobox
            events={events}
            value={form.event}
            onChange={(event) => set({ event })}
          />
        </Field>

        <Field label="אדם">
          <PersonCombobox
            persons={persons}
            value={form.person}
            onChange={(person) => set({ person })}
          />
        </Field>
      </div>

      {/* Extra fields for a brand-new event only. The "type" here is the
          category (not the name) — it drives the statistics-by-type breakdown. */}
      {isNewEvent && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Field label="סוג האירוע (קטגוריה)">
              <Select
                value={form.newType}
                onChange={(value) => set({ newType: value })}
                options={eventTypeOptions.map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Field>
            <p className="mt-1.5 text-xs text-muted">
              הקטגוריה (חתונה, ברית…) משמשת לפילוח בסטטיסטיקות.
            </p>
          </div>
          <div className="flex items-start pt-6">
            <Toggle
              checked={form.newIsMine}
              onChange={(value) => set({ newIsMine: value })}
              label="האירוע שלי"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="כיוון">
          <Select
            value={form.direction}
            onChange={(value) => set({ direction: value })}
            options={directionOptions.map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Field>

        <Field label="סכום">
          <NumberStepper
            value={form.amount}
            onChange={(v) => set({ amount: v })}
          />
        </Field>

        <Field label="תאריך">
          <DatePicker value={form.date} onChange={(iso) => set({ date: iso })} />
        </Field>
      </div>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        {submitting && <Spinner />}
        {submitting ? "מוסיף…" : "הוסף"}
      </button>
    </form>
  );
}
