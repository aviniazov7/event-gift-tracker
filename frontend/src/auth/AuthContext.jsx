import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loginWithGoogle as apiLoginWithGoogle,
  setAuthToken,
  setUnauthorizedHandler,
  TOKEN_STORAGE_KEY,
} from "../api/client.js";

// Persisted user profile lives next to the token. The token key itself is
// owned by the API client (it reads it at module load).
const USER_STORAGE_KEY = "giftledger_user";

const AuthContext = createContext(null);

// Read a previously stored session, if any, so a returning user stays logged in
// across reloads. Both pieces must be present and parseable to count.
function readStoredSession() {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const userRaw = localStorage.getItem(USER_STORAGE_KEY);
    if (token && userRaw) return { token, user: JSON.parse(userRaw) };
  } catch {
    /* corrupt storage — fall through to a logged-out state */
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* ignore storage failures */
    }
    setAuthToken(null);
    setSession({ token: null, user: null });
  }, []);

  // Wire any API 401 to a full logout, so an expired token returns to login.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (credential) => {
    // Exchange the Google ID token for our own JWT, then persist the session.
    const data = await apiLoginWithGoogle(credential);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    } catch {
      /* ignore storage failures — session still works for this tab */
    }
    setAuthToken(data.access_token);
    setSession({ token: data.access_token, user: data.user });
  }, []);

  const value = {
    user: session.user,
    token: session.token,
    isAuthenticated: Boolean(session.token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
