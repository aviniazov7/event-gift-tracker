import { useEffect, useMemo, useState } from "react";
import {
  downloadTransactionsCsv,
  getEvents,
  getPersons,
  getSummary,
  getTransactions,
} from "../api/client.js";
import { ArrowRightLeft, Download } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import DirectionBadge from "../components/DirectionBadge.jsx";
import AnimatedMoney from "../components/AnimatedMoney.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Skeleton from "../components/Skeleton.jsx";
import Spinner from "../components/Spinner.jsx";
import { formatMoney } from "../utils/money.js";
import { formatDate } from "../utils/dates.js";

// Branded loading placeholder mirroring the total card + segmented control + rows.
function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-soft dark:border-white/10">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
      <ul className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-soft dark:border-white/10"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-16" />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Tabs map to the transactions endpoint's `direction` filter ("all" = no filter).
const TABS = [
  { key: "all", label: "הכל" },
  { key: "given", label: "נתתי" },
  { key: "received", label: "קיבלתי" },
];

function TransactionRow({ tx, personName, eventName, index, nav }) {
  const given = tx.direction === "given";
  return (
    <li
      className="animate-row flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-soft transition-colors duration-200 hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-500/40"
      style={{ "--row-delay": `${Math.min(index, 10) * 35}ms` }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <DirectionBadge direction={tx.direction} />
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => nav.openPerson(tx.person_id)}
            className="focus-ring block max-w-full truncate rounded-md text-sm font-medium text-ink hover:underline"
          >
            {personName}
          </button>
          <p className="truncate text-xs text-muted">
            <button
              type="button"
              onClick={() => nav.openEvent(tx.event_id)}
              className="focus-ring rounded-md hover:underline"
            >
              {eventName}
            </button>{" "}
            · {formatDate(tx.date)}
          </p>
        </div>
      </div>
      <span
        className={`shrink-0 text-base font-semibold tabular-nums ${
          given
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-amber-600 dark:text-amber-400"
        }`}
      >
        {formatMoney(tx.amount)}
      </span>
    </li>
  );
}

export default function TransactionsPage({ nav }) {
  const [tab, setTab] = useState("all");
  const [txns, setTxns] = useState([]);
  const [persons, setPersons] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [exporting, setExporting] = useState(false);

  // Reuse the endpoint's direction filter: refetch the list when the tab
  // changes ("all" sends no direction).
  async function loadTxns(key) {
    const params = key === "all" ? {} : { direction: key };
    setTxns(await getTransactions(params));
  }

  useEffect(() => {
    Promise.all([getPersons(), getEvents(), getSummary(), getTransactions()])
      .then(([ppl, evts, sum, all]) => {
        setPersons(ppl);
        setEvents(evts);
        setSummary(sum);
        setTxns(all);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  function selectTab(key) {
    setTab(key);
    loadTxns(key).catch(() => setStatus("error"));
  }

  // Export the current view (honours the active tab) to a CSV download.
  async function handleExport() {
    setExporting(true);
    try {
      await downloadTransactionsCsv(tab);
    } finally {
      setExporting(false);
    }
  }

  const personName = useMemo(() => {
    const map = new Map(persons.map((p) => [p.id, p.full_name]));
    return (id) => map.get(id) ?? `אדם #${id}`;
  }, [persons]);

  const eventName = useMemo(() => {
    const map = new Map(events.map((e) => [e.id, e.title]));
    return (id) => map.get(id) ?? `אירוע #${id}`;
  }, [events]);

  if (status === "loading") {
    return (
      <div className="animate-page">
        <BackButton onClick={nav.back} />
        <TransactionsSkeleton />
      </div>
    );
  }

  if (status === "error" || !summary) {
    return (
      <div>
        <BackButton onClick={nav.back} />
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          לא הצלחנו לטעון את התנועות.
        </div>
      </div>
    );
  }

  // The headline total + its color follow the active tab.
  const net = Number(summary.net);
  const totals = {
    all: {
      label: "מאזן",
      value: summary.net,
      tone:
        net >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400",
    },
    given: {
      label: "סך נתתי",
      value: summary.total_given,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    received: {
      label: "סך קיבלתי",
      value: summary.total_received,
      tone: "text-amber-600 dark:text-amber-400",
    },
  };
  const active = totals[tab];

  return (
    <div className="animate-page">
      <BackButton onClick={nav.back} />

      <div className="space-y-6">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">תנועות</h2>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || txns.length === 0}
            className="focus-ring inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-3 py-1.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
          >
            {exporting ? (
              <Spinner />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            ייצוא ל-CSV
          </button>
        </header>

        {/* Active-tab total + the segmented control. */}
        <div className="space-y-4 rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-soft dark:border-white/10">
          <div className="text-center">
            <p className="text-xs font-medium text-muted">{active.label}</p>
            <AnimatedMoney
              value={active.value}
              className={`mt-1 block text-3xl font-semibold tracking-tight ${active.tone}`}
            />
          </div>

          <div
            role="tablist"
            aria-label="סינון לפי כיוון"
            className="flex w-full rounded-xl border border-black/10 bg-cream p-1 dark:border-white/15 dark:bg-night"
          >
            {TABS.map((t) => {
              const selected = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectTab(t.key)}
                  className={`focus-ring flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    selected
                      ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* The filtered list. */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold tracking-tight">רשימה</h3>
            <span className="text-sm text-muted">{txns.length} תנועות</span>
          </div>

          {txns.length === 0 ? (
            <EmptyState
              icon={ArrowRightLeft}
              title="אין תנועות להצגה"
              description="כשתוסיפו מתנות הן יופיעו כאן, מסוננות לפי כיוון."
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
            <ul className="space-y-3">
              {txns.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  personName={personName(tx.person_id)}
                  eventName={eventName(tx.event_id)}
                  index={i}
                  nav={nav}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
