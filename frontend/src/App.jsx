import { lazy, Suspense, useState } from "react";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Spinner from "./components/Spinner.jsx";
import { useAuth } from "./auth/AuthContext.jsx";

// Code-split the statistics screen: it pulls in recharts (~370KB), which only
// needs to load when the user actually opens סטטיסטיקות — keeping the initial
// bundle (and cold-start first paint) lean.
const StatisticsPage = lazy(() => import("./pages/StatisticsPage.jsx"));

// Small themed fallback shown while a lazy route chunk downloads.
function RouteFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
      <Spinner />
      טוען…
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  // A simple view stack so "back" returns to the previous screen
  // (Home → Event → Person → back → Event → back → Home).
  const [stack, setStack] = useState([{ name: "home" }]);
  const current = stack[stack.length - 1];

  // Logged-out visitors get the marketing landing page (with the Google sign-in
  // CTAs). A 401 from the API clears auth and brings the user right back here.
  if (!isAuthenticated) return <LandingPage />;

  const push = (view) => setStack((s) => [...s, view]);

  const nav = {
    openEvent: (eventId) => push({ name: "event", eventId }),
    openPerson: (personId) => push({ name: "person", personId }),
    openStats: () => push({ name: "stats" }),
    openTransactions: () => push({ name: "transactions" }),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    goHome: () => setStack([{ name: "home" }]),
  };

  return (
    <Layout
      onHome={nav.goHome}
      onStats={nav.openStats}
      onTransactions={nav.openTransactions}
    >
      {current.name === "home" && <HomePage nav={nav} />}
      {current.name === "event" && (
        <EventDetail eventId={current.eventId} nav={nav} />
      )}
      {current.name === "person" && (
        <PersonDetail personId={current.personId} nav={nav} />
      )}
      {current.name === "stats" && (
        <Suspense fallback={<RouteFallback />}>
          <StatisticsPage nav={nav} />
        </Suspense>
      )}
      {current.name === "transactions" && <TransactionsPage nav={nav} />}
    </Layout>
  );
}
