import { useEffect, useState } from "react";
import { createPerson, getPersons } from "../api/client.js";
import PersonForm from "../components/PersonForm.jsx";
import PersonCard from "../components/PersonCard.jsx";

export default function PersonsPage() {
  const [persons, setPersons] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    getPersons()
      .then((data) => {
        setPersons(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleCreate(payload) {
    await createPerson(payload);
    setPersons(await getPersons());
  }

  if (status === "loading") {
    return <p className="text-sm text-muted">טוען אנשים…</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
        לא הצלחנו לטעון את האנשים. ודאו שהשרת רץ.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PersonForm onCreate={handleCreate} />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">אנשים</h2>
          <span className="text-sm text-muted">{persons.length} אנשים</span>
        </div>

        {persons.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted">
            אין אנשים עדיין.
          </div>
        ) : (
          <ul className="space-y-3">
            {persons.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
