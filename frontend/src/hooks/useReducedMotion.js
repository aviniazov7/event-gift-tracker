import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// True when the user has asked the OS to reduce motion. JS-driven animations
// (e.g. the count-up) read this to stay still; CSS animations are handled by
// the global guard in index.css.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
