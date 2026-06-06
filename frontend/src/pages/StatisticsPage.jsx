import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { getOverview } from "../api/client.js";
import BackButton from "../components/BackButton.jsx";
import AnimatedMoney from "../components/AnimatedMoney.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { useCountUp } from "../hooks/useCountUp.js";
import { eventTypeLabels } from "../utils/labels.js";
import { formatMoney } from "../utils/money.js";

// Compact money for axis ticks (e.g. ₪1.2K) so long numbers never overflow.
const compact = new Intl.NumberFormat("he-IL", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const compactMoney = (v) => `₪${compact.format(Number(v))}`;

// Pull theme-matched colors so the charts read well in both light and dark.
function usePalette() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return {
    isDark,
    given: isDark ? "#34d399" : "#059669", // emerald (נתתי)
    received: isDark ? "#fbbf24" : "#d97706", // amber (קיבלתי)
    axis: isDark ? "#a8a094" : "#8a8275", // muted
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    cardBg: isDark ? "#232019" : "#ffffff",
    ink: isDark ? "#f1ede6" : "#2b2722",
  };
}

// Themed tooltip — the default recharts box is white and clashes in dark mode.
function MoneyTooltip({ active, payload, label, palette }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="rounded-xl border border-black/10 bg-card px-3 py-2 text-xs shadow-lg dark:border-white/15"
      style={{ backgroundColor: palette.cardBg, color: palette.ink }}
    >
      {label != null && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-muted">{entry.name}:</span>
          <span className="font-semibold">{formatMoney(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, height = 260, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-black/5 bg-card px-4 py-4 shadow-sm dark:border-white/10">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {/* dir=ltr stabilises recharts' width measurement in an RTL page; the
          Hebrew labels still render correctly and the axes are RTL-ordered. */}
      <div dir="ltr" className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const STAT_TONE = {
  given: "text-emerald-600 dark:text-emerald-400",
  received: "text-amber-600 dark:text-amber-400",
  netPositive: "text-emerald-600 dark:text-emerald-400",
  netNegative: "text-rose-600 dark:text-rose-400",
  ink: "text-ink",
};

const STAT_ACCENT = {
  given: "from-emerald-500/10",
  received: "from-amber-500/10",
  netPositive: "from-emerald-500/12",
  netNegative: "from-rose-500/12",
  ink: "from-emerald-500/8",
};

// A stat card whose figure counts up on mount. `format` picks money vs a plain
// integer (event/person counts). Layered shadow + a soft brand-tinted accent.
function StatCard({ label, value, tone = "ink", format = "money" }) {
  const animated = useCountUp(value);
  const display =
    format === "int"
      ? Math.round(animated).toLocaleString("he-IL")
      : formatMoney(animated);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-card px-4 py-3 shadow-soft dark:border-white/10">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-bl to-transparent ${STAT_ACCENT[tone]}`}
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className={`mt-1 text-xl font-semibold tabular-nums ${STAT_TONE[tone]}`}>
          {display}
        </p>
      </div>
    </div>
  );
}

const truncate = (s, n = 9) => (s.length > n ? `${s.slice(0, n)}…` : s);

// Branded loading placeholder: the stat-card grid + a chart block.
function StatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/5 bg-card px-4 py-3 shadow-soft dark:border-white/10"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-black/5 bg-card px-4 py-4 shadow-soft dark:border-white/10">
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function StatisticsPage({ nav }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const palette = usePalette();
  const reduced = useReducedMotion();
  // Chart entrance: a short grow, disabled under reduced-motion.
  const chartAnim = { isAnimationActive: !reduced, animationDuration: 400 };

  useEffect(() => {
    getOverview()
      .then((d) => {
        setData(d);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="animate-page">
        <BackButton onClick={nav.back} />
        <StatsSkeleton />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div>
        <BackButton onClick={nav.back} />
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          לא הצלחנו לטעון את הסטטיסטיקות.
        </div>
      </div>
    );
  }

  const net = Number(data.net);

  const giveVsReceive = [
    { name: "נתתי", value: Number(data.total_given), key: "given" },
    { name: "קיבלתי", value: Number(data.total_received), key: "received" },
  ];

  const byType = data.breakdown_by_event_type.map((b) => ({
    type: eventTypeLabels[b.type] ?? b.type,
    given: Number(b.given),
    received: Number(b.received),
  }));

  const people = data.top_people.map((p) => ({
    name: p.person_name,
    given: Number(p.given),
    received: Number(p.received),
  }));

  const tooltip = <Tooltip content={<MoneyTooltip palette={palette} />} cursor={{ fill: palette.grid }} />;
  const legend = (
    <Legend wrapperStyle={{ fontSize: 12, color: palette.axis }} />
  );

  return (
    <div className="animate-page">
      <BackButton onClick={nav.back} />

      <div className="space-y-8">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight">סטטיסטיקות</h2>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="סך נתתי" value={Number(data.total_given)} tone="given" />
          <StatCard label="סך קיבלתי" value={Number(data.total_received)} tone="received" />
          <StatCard
            label="מאזן"
            value={Number(data.net)}
            tone={net >= 0 ? "netPositive" : "netNegative"}
          />
          <StatCard label="מספר אירועים" value={data.event_count} format="int" />
          <StatCard label="מספר אנשים" value={data.person_count} format="int" />
          <StatCard label="מתנה ממוצעת" value={Number(data.avg_given)} tone="given" />
        </div>

        {/* Biggest gift highlight */}
        {data.biggest_gift && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 shadow-soft dark:border-emerald-500/25 dark:bg-emerald-500/10">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              המתנה הגדולה ביותר
            </p>
            <AnimatedMoney
              value={data.biggest_gift.amount}
              className="mt-1 block text-lg font-semibold text-emerald-700 dark:text-emerald-200"
            />
            <p className="text-sm text-muted">
              {data.biggest_gift.person_name} · {data.biggest_gift.event_title}
            </p>
          </div>
        )}

        {data.gift_count === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="אין עדיין נתונים להצגה"
            description="הוסיפו מתנות כדי לראות סטטיסטיקות וגרפים."
            action={
              <button
                type="button"
                onClick={nav.goHome}
                className="focus-ring inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                הוספת מתנה
              </button>
            }
          />
        ) : (
          <div className="space-y-5">
            {/* 1) Given vs received */}
            <ChartCard title="נתתי מול קיבלתי" height={240}>
              <BarChart data={giveVsReceive} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  reversed
                  tick={{ fill: palette.axis, fontSize: 13 }}
                  axisLine={{ stroke: palette.grid }}
                  tickLine={false}
                />
                <YAxis
                  orientation="right"
                  tickFormatter={compactMoney}
                  tick={{ fill: palette.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                {tooltip}
                <Bar dataKey="value" name="סכום" radius={[6, 6, 0, 0]} maxBarSize={72} {...chartAnim}>
                  {giveVsReceive.map((d) => (
                    <Cell key={d.key} fill={d.key === "given" ? palette.given : palette.received} />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>

            {/* 2) Breakdown by event type */}
            <ChartCard title="פילוח לפי סוג אירוע" height={280}>
              <BarChart data={byType} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis
                  dataKey="type"
                  reversed
                  tick={{ fill: palette.axis, fontSize: 12 }}
                  axisLine={{ stroke: palette.grid }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  orientation="right"
                  tickFormatter={compactMoney}
                  tick={{ fill: palette.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                {tooltip}
                {legend}
                <Bar dataKey="given" name="נתתי" fill={palette.given} radius={[5, 5, 0, 0]} maxBarSize={32} {...chartAnim} />
                <Bar dataKey="received" name="קיבלתי" fill={palette.received} radius={[5, 5, 0, 0]} maxBarSize={32} {...chartAnim} />
              </BarChart>
            </ChartCard>

            {/* 3) Top people (horizontal, RTL) */}
            <ChartCard title="האנשים המובילים" height={Math.max(200, people.length * 56 + 60)}>
              <BarChart
                data={people}
                layout="vertical"
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} horizontal={false} />
                <XAxis
                  type="number"
                  reversed
                  tickFormatter={compactMoney}
                  tick={{ fill: palette.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  orientation="right"
                  tickFormatter={(v) => truncate(v)}
                  tick={{ fill: palette.axis, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                {tooltip}
                {legend}
                <Bar dataKey="given" name="נתתי" fill={palette.given} radius={[6, 0, 0, 6]} maxBarSize={14} {...chartAnim} />
                <Bar dataKey="received" name="קיבלתי" fill={palette.received} radius={[6, 0, 0, 6]} maxBarSize={14} {...chartAnim} />
              </BarChart>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}
