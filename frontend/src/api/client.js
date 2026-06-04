// Base URL of the GiftLedger API. Override with VITE_API_BASE if needed.
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    // Surface the API's `detail` message when there is one.
    let detail;
    try {
      detail = (await res.json()).detail;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(detail ?? `Request to ${path} failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export function getTransactions() {
  return request("/transactions");
}

export function getPersons() {
  return request("/persons");
}

export function getEvents() {
  return request("/events");
}

export function getSummary() {
  return request("/stats/summary");
}

export function createTransaction(payload) {
  return request("/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
