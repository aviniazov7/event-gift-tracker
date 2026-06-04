import { directionLabels } from "../utils/labels.js";

export default function DirectionBadge({ direction }) {
  const given = direction === "given";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        given ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {directionLabels[direction] ?? direction}
    </span>
  );
}
