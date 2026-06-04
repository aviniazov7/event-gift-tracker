const currency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
});

// Amounts arrive from the API as strings (Decimal) — coerce before formatting.
export function formatMoney(value) {
  return currency.format(Number(value));
}
