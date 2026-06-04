import { useEffect, useMemo, useState } from "react";
import {
  createTransaction,
  getEvents,
  getPersons,
  getSummary,
  getTransactions,
} from "../api/client.js";
import SummaryHeader from "../components/SummaryHeader.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import TransactionCard from "../components/TransactionCard.jsx";
import FilterBar, { emptyFilters } from "../components/FilterBar.jsx";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [persons, setPersons] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  // Static lists + overall summary load once.
  useEffect(() => {
    Promise.all([getPersons(), getEvents(), getSummary()])
      .then(([ppl, evts, sum]) => {
        setPersons(ppl);
        setEvents(evts);
        setSummary(sum);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Re-fetch the list whenever the filters change (also runs on first mount).
  useEffect(() => {
    getTransactions(filters)
      .then(setTransactions)
      .catch(() => setStatus("error"));
  }, [filters]);

  // After a create, refresh the (currently-filtered) list and the summary.
  async function handleCreate(payload) {
    await createTransaction(payload);
    const [txns, sum] = await Promise.all([
      getTransactions(filters),
      getSummary(),
    ]);
    setTransactions(txns);
    setSummary(sum);
  }

  // Lookup maps so each transaction can show names instead of ids.
  const personName = useMemo(() => {
    const map = new Map(persons.map((p) => [p.id, p.full_name]));
    return (id) => map.get(id) ?? `אדם #${id}`;
  }, [persons]);

  const eventName = useMemo(() => {
    const map = new Map(events.map((e) => [e.id, e.title]));
    return (id) => map.get(id) ?? `אירוע #${id}`;
  }, [events]);

  if (status === "loading") {
    return <p className="text-sm text-muted">טוען נתונים…</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        לא הצלחנו להתחבר לשרת. ודאו שהשרת רץ בכתובת
        <span className="font-medium"> http://localhost:8000</span>.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryHeader summary={summary} />

      <TransactionForm
        persons={persons}
        events={events}
        onCreate={handleCreate}
      />

      <FilterBar
        persons={persons}
        events={events}
        filters={filters}
        onChange={setFilters}
      />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">תנועות</h2>
          <span className="text-sm text-muted">
            {transactions.length} תנועות
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted dark:border-white/10">
            אין תנועות שתואמות את הסינון.
          </div>
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                tx={tx}
                personName={personName(tx.person_id)}
                eventName={eventName(tx.event_id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
