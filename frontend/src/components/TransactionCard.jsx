import DirectionBadge from "./DirectionBadge.jsx";
import { formatMoney } from "../utils/money.js";

export default function TransactionCard({ tx, personName, eventName }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm dark:border-white/10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DirectionBadge direction={tx.direction} />
          <span className="text-sm text-muted">{tx.date}</span>
        </div>
        <p className="text-sm font-medium text-ink">
          {personName} · {eventName}
        </p>
        {tx.notes && <p className="text-sm text-muted">{tx.notes}</p>}
      </div>
      <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
        {formatMoney(tx.amount)}
      </span>
    </li>
  );
}
