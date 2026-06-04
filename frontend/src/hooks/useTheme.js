import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function getInitialTheme() {
  // Saved choice wins; otherwise follow the OS preference.
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Keep the <html> class and localStorage in sync with the chosen theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return { theme, toggle };
}
