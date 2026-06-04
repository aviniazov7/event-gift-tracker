import { useEffect, useState } from "react";
import { getTransactions } from "../api/client.js";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function DirectionBadge({ direction }) {
  const given = direction === "given";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        given
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {direction}
    </span>
  );
}

function TransactionCard({ tx }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DirectionBadge direction={tx.direction} />
          <span className="text-sm text-muted">{tx.date}</span>
        </div>
        <p className="text-sm text-muted">
          Person #{tx.person_id} · Event #{tx.event_id}
          {tx.notes ? ` · ${tx.notes}` : ""}
        </p>
      </div>
      <span className="text-lg font-semibold text-emerald-600">
        {currency.format(Number(tx.amount))}
      </span>
    </li>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    getTransactions()
      .then((data) => {
        setTransactions(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Transactions</h2>
        {status === "ready" && (
          <span className="text-sm text-muted">
            {transactions.length} total
          </span>
        )}
      </div>

      {status === "loading" && (
        <p className="text-sm text-muted">Loading transactions…</p>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          Couldn&apos;t reach the API. Is the backend running on
          <span className="font-medium"> http://localhost:8000</span>?
        </div>
      )}

      {status === "ready" && transactions.length === 0 && (
        <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted">
          No transactions yet.
        </div>
      )}

      {status === "ready" && transactions.length > 0 && (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </section>
  );
}
