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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fire-and-forget nudge to wake the (free-tier, possibly sleeping) backend so it
// boots while the user reads the login screen. Errors are intentionally ignored.
export function prewarm() {
  try {
    fetch(`${API_BASE}/health`, { method: "GET", cache: "no-store" }).catch(
      () => {},
    );
  } catch {
    /* ignore — best-effort only */
  }
}

// fetch with a hard per-attempt timeout, so a hung connection can't wait forever.
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Statuses Render returns while a sleeping service is waking — worth retrying.
const COLD_START_STATUSES = new Set([429, 500, 502, 503, 504]);

// Retry a request through a cold start: on network errors, timeouts, or wakeup
// statuses, back off and try again until `totalMs` elapses, then give up (so it
// surfaces an error instead of hanging). Non-transient responses (200, 401, 4xx)
// return immediately — bad credentials fail fast, not after a minute.
async function fetchResilient(
  url,
  options,
  { totalMs = 60000, attemptTimeoutMs = 12000 } = {},
) {
  const deadline = Date.now() + totalMs;
  let delay = 1000;
  let lastError = new Error("request failed");

  for (;;) {
    try {
      const res = await fetchWithTimeout(url, options, attemptTimeoutMs);
      if (!COLD_START_STATUSES.has(res.status)) return res;
      lastError = new Error(`server waking (${res.status})`);
    } catch (err) {
      lastError = err; // network error or per-attempt timeout (AbortError)
    }
    if (Date.now() + delay >= deadline) break;
    await sleep(delay);
    delay = Math.min(Math.round(delay * 1.7), 8000); // capped exponential backoff
  }
  throw lastError;
}

async function request(
  path,
  { skipAuthRedirect = false, retry = false, ...options } = {},
) {
  // Attach the bearer token to every request when we have one.
  const headers = { ...(options.headers ?? {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const url = `${API_BASE}${path}`;
  const fetchOptions = { ...options, headers };
  // `retry` is for the cold-start-sensitive calls (login + initial load); it
  // never blocks indefinitely (bounded by fetchResilient's deadline).
  const res = retry
    ? await fetchResilient(url, fetchOptions)
    : await fetch(url, fetchOptions);

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

function del(path) {
  return request(path, { method: "DELETE" });
}

// Exchange a Google ID token for an app JWT + user. Opts out of the 401
// redirect so a bad credential shows its error on the login screen.
export function loginWithGoogle(credential) {
  // Retry through a cold start: the first call after the backend sleeps may hit
  // a wakeup (502/timeout); without this, login hangs at "מתחבר…".
  return request("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
    skipAuthRedirect: true,
    retry: true,
  });
}

export function getTransactions(params = {}, opts = {}) {
  // Only include filters that actually have a value.
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== null && value !== undefined) {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return request(`/transactions${qs ? `?${qs}` : ""}`, opts);
}

export function getPersons(opts = {}) {
  return request("/persons", opts);
}

export function getReciprocity(personId) {
  return request(`/persons/${personId}/reciprocity`);
}

export function getEvents(opts = {}) {
  return request("/events", opts);
}

export function getSummary(opts = {}) {
  return request("/stats/summary", opts);
}

export function getOverview() {
  return request("/stats/overview");
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

// One-step gift logging: find-or-create the event + person and record the gift
// in a single atomic request. Returns { transaction, event, person }.
export function quickAdd(payload) {
  return post("/quick-add", payload);
}

// Deletes are scoped to the current user server-side. Deleting an event or
// person cascades to its gifts.
export function deleteTransaction(id) {
  return del(`/transactions/${id}`);
}

export function deleteEvent(id) {
  return del(`/events/${id}`);
}

export function deletePerson(id) {
  return del(`/persons/${id}`);
}
