import { useCountUp } from "../hooks/useCountUp.js";
import { formatMoney } from "../utils/money.js";

// A money figure that counts up to its value on mount / when it changes.
// `tabular-nums` keeps the width stable while the digits animate.
export default function AnimatedMoney({ value, className = "", duration }) {
  const animated = useCountUp(value, duration);
  return (
    <span className={`tabular-nums ${className}`}>{formatMoney(animated)}</span>
  );
}
