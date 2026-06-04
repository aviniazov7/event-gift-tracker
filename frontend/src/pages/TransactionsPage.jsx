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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [persons, setPersons] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  // Initial load of everything the page needs.
  useEffect(() => {
    Promise.all([getTransactions(), getPersons(), getEvents(), getSummary()])
      .then(([txns, ppl, evts, sum]) => {
        setTransactions(txns);
        setPersons(ppl);
        setEvents(evts);
        setSummary(sum);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // After a create, transactions and summary change; persons/events don't.
  async function refreshLedger() {
    const [txns, sum] = await Promise.all([getTransactions(), getSummary()]);
    setTransactions(txns);
    setSummary(sum);
  }

  async function handleCreate(payload) {
    await createTransaction(payload);
    await refreshLedger();
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
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
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

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">תנועות</h2>
          <span className="text-sm text-muted">
            {transactions.length} תנועות
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted">
            אין תנועות עדיין.
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
