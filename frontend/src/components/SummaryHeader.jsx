import { formatMoney } from "../utils/money.js";

function StatCard({ label, value, tone }) {
  const tones = {
    given: "text-emerald-600",
    received: "text-amber-600",
    netPositive: "text-emerald-600",
    netNegative: "text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default function SummaryHeader({ summary }) {
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
