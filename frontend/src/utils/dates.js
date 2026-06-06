// Display a stored ISO date (YYYY-MM-DD) as Israeli DD/MM/YYYY. This is a
// DISPLAY-ONLY helper — the stored value, the API, and DatePicker's onChange
// all stay ISO. Returns "" for empty input, and passes through anything that
// isn't a plain ISO date unchanged.
export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}
