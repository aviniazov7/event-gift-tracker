import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion.js";

// Ease-out cubic — matches the CSS --ease-out feel.
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Animate a number from its previous value to `target` over `duration` ms via
// requestAnimationFrame. Returns the current (animating) value. Respects
// reduced-motion (jumps straight to the target). Re-animates when target
// changes, so refreshed totals count to their new value.
export function useCountUp(target, duration = 700) {
  const reduced = useReducedMotion();
  const end = Number(target) || 0;
  const [value, setValue] = useState(reduced ? end : 0);
  const fromRef = useRef(reduced ? end : 0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setValue(end);
      fromRef.current = end;
      return;
    }
    const from = fromRef.current;
    let start = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const current = from + (end - from) * easeOut(p);
      setValue(current);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration, reduced]);

  return value;
}
