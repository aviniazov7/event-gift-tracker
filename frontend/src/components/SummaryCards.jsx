import { formatMoney } from "../utils/money.js";

function StatCard({ label, value, tone }) {
  const tones = {
    given: "text-emerald-600 dark:text-emerald-400",
    received: "text-amber-600 dark:text-amber-400",
    netPositive: "text-emerald-600 dark:text-emerald-400",
    netNegative: "text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm dark:border-white/10">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}

// Overall given/received/net across all events (from GET /stats/summary).
export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const net = Number(summary.net);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        label="סך נתתי"
        value={formatMoney(summary.total_given)}
        tone="given"
      />
      <StatCard
        label="סך קיבלתי"
        value={formatMoney(summary.total_received)}
        tone="received"
      />
      <StatCard
        label="מאזן"
        value={formatMoney(summary.net)}
        tone={net >= 0 ? "netPositive" : "netNegative"}
      />
    </div>
  );
}
