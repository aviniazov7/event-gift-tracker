import { useState } from "react";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import StatisticsPage from "./pages/StatisticsPage.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import { useAuth } from "./auth/AuthContext.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  // A simple view stack so "back" returns to the previous screen
  // (Home → Event → Person → back → Event → back → Home).
  const [stack, setStack] = useState([{ name: "home" }]);
  const current = stack[stack.length - 1];

  // Gate the whole app behind Google Sign-In. A 401 from the API clears auth
  // and brings the user right back here.
  if (!isAuthenticated) return <LoginScreen />;

  const push = (view) => setStack((s) => [...s, view]);

  const nav = {
    openEvent: (eventId) => push({ name: "event", eventId }),
    openPerson: (personId) => push({ name: "person", personId }),
    openStats: () => push({ name: "stats" }),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    goHome: () => setStack([{ name: "home" }]),
  };

  return (
    <Layout onHome={nav.goHome} onStats={nav.openStats}>
      {current.name === "home" && <HomePage nav={nav} />}
      {current.name === "event" && (
        <EventDetail eventId={current.eventId} nav={nav} />
      )}
      {current.name === "person" && (
        <PersonDetail personId={current.personId} nav={nav} />
      )}
      {current.name === "stats" && <StatisticsPage nav={nav} />}
    </Layout>
  );
}
