import { useState } from "react";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";

export default function App() {
  // A simple view stack so "back" returns to the previous screen
  // (Home → Event → Person → back → Event → back → Home).
  const [stack, setStack] = useState([{ name: "home" }]);
  const current = stack[stack.length - 1];

  const push = (view) => setStack((s) => [...s, view]);

  const nav = {
    openEvent: (eventId) => push({ name: "event", eventId }),
    openPerson: (personId) => push({ name: "person", personId }),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    goHome: () => setStack([{ name: "home" }]),
  };

  return (
    <Layout onHome={nav.goHome}>
      {current.name === "home" && <HomePage nav={nav} />}
      {current.name === "event" && (
        <EventDetail eventId={current.eventId} nav={nav} />
      )}
      {current.name === "person" && (
        <PersonDetail personId={current.personId} nav={nav} />
      )}
    </Layout>
  );
}
