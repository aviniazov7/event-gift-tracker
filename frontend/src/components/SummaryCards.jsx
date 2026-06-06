import AnimatedMoney from "./AnimatedMoney.jsx";

const toneText = {
  given: "text-emerald-600 dark:text-emerald-400",
  received: "text-amber-600 dark:text-amber-400",
  netPositive: "text-emerald-600 dark:text-emerald-400",
  netNegative: "text-rose-600 dark:text-rose-400",
};

// A subtle gradient wash in the card's corner, tinted to the figure's meaning.
const toneAccent = {
  given: "from-emerald-500/10",
  received: "from-amber-500/10",
  netPositive: "from-emerald-500/12",
  netNegative: "from-rose-500/12",
};

function Card({ label, value, tone, big = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-black/5 bg-card px-5 shadow-soft dark:border-white/10 ${
        big ? "py-5" : "py-4"
      }`}
    >
      {/* Brand-tinted depth accent — soft, never loud; a touch stronger on the
          balance card so it reads as the hero figure. */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-bl to-transparent ${toneAccent[tone]}`}
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-xs font-medium text-muted">{label}</p>
        <AnimatedMoney
          value={value}
          duration={big ? 950 : 700}
          className={`mt-1 block font-semibold tracking-tight ${
            big ? "text-4xl" : "text-2xl"
          } ${toneText[tone]}`}
        />
      </div>
    </div>
  );
}

// Overall given/received/net (from GET /stats/summary). The balance leads —
// full width and larger — with given/received beneath it.
export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const net = Number(summary.net);
  return (
    <div className="space-y-3">
      <Card
        label="מאזן"
        value={summary.net}
        tone={net >= 0 ? "netPositive" : "netNegative"}
        big
      />
      <div className="grid grid-cols-2 gap-3">
        <Card label="סך נתתי" value={summary.total_given} tone="given" />
        <Card label="סך קיבלתי" value={summary.total_received} tone="received" />
      </div>
    </div>
  );
}
