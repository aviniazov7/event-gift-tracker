import { useState } from "react";
import Layout from "./components/Layout.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import PersonsPage from "./pages/PersonsPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";

const PAGES = {
  transactions: TransactionsPage,
  persons: PersonsPage,
  events: EventsPage,
};

export default function App() {
  const [page, setPage] = useState("transactions");
  const CurrentPage = PAGES[page];

  return (
    <Layout page={page} onNavigate={setPage}>
      <CurrentPage />
    </Layout>
  );
}
