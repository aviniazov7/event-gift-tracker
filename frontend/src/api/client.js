// Base URL of the GiftLedger API. Override with VITE_API_BASE if needed.
// Render injects another service's host without a scheme, so assume https for
// a bare host; the local default already includes a scheme.
const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
const API_BASE = /^https?:\/\//.test(RAW_API_BASE)
  ? RAW_API_BASE
  : `https://${RAW_API_BASE}`;

// localStorage key for the app JWT. Exported so the auth layer reuses the same
// key — the token is read here at module load so the very first request is
// already authenticated, regardless of React effect ordering.
export const TOKEN_STORAGE_KEY = "giftledger_token";

let authToken = (() => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
})();

// The auth layer registers a callback so a stale/expired token (any 401) drops
// the user back to the login screen instead of leaving the UI half-broken.
let unauthorizedHandler = null;

export function setAuthToken(token) {
  authToken = token;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function request(path, { skipAuthRedirect = false, ...options } = {}) {
  // Attach the bearer token to every request when we have one.
  const headers = { ...(options.headers ?? {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // A 401 means our token is missing or expired — log out everywhere. The
  // login call opts out (skipAuthRedirect) so a rejected sign-in surfaces its
  // error message instead of triggering a redirect.
  if (res.status === 401 && !skipAuthRedirect) {
    unauthorizedHandler?.();
  }

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

function post(path, payload) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Exchange a Google ID token for an app JWT + user. Opts out of the 401
// redirect so a bad credential shows its error on the login screen.
export function loginWithGoogle(credential) {
  return request("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
    skipAuthRedirect: true,
  });
}

export function getTransactions(params = {}) {
  // Only include filters that actually have a value.
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== null && value !== undefined) {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return request(`/transactions${qs ? `?${qs}` : ""}`);
}

export function getPersons() {
  return request("/persons");
}

export function getReciprocity(personId) {
  return request(`/persons/${personId}/reciprocity`);
}

export function getEvents() {
  return request("/events");
}

export function getSummary() {
  return request("/stats/summary");
}

export function createTransaction(payload) {
  return post("/transactions", payload);
}

export function createPerson(payload) {
  return post("/persons", payload);
}

export function createEvent(payload) {
  return post("/events", payload);
}
