import { useEffect, useState } from "react";
import { api, formatDate } from "../api";
import StatusBadge from "../components/StatusBadge.jsx";

const STEPS = ["applied", "shortlisted", "interview", "selected"];

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState("");

  const load = () => api("/applications/me").then(setApps).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await api(`/applications/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <h1>My applications</h1>
      {error && <div className="alert error">{error}</div>}
      {!apps.length && <p className="muted">You haven't applied to any drive yet.</p>}
      <div className="list">
        {apps.map((a) => {
          const current = a.status === "rejected" ? -1 : STEPS.indexOf(a.status);
          return (
            <div key={a._id} className="card app">
              <div className="drive-top">
                <div>
                  <h3>{a.drive?.company || "Deleted drive"}</h3>
                  <div className="muted">{a.drive?.role} · {a.drive?.ctc} LPA · applied {formatDate(a.createdAt)}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="steps">
                {STEPS.map((s, i) => (
                  <div key={s} className={`step ${i <= current ? "done" : ""} ${a.status === "rejected" ? "dim" : ""}`}>
                    <span className="dot" />
                    {s}
                  </div>
                ))}
              </div>
              {a.status === "applied" && (
                <button className="btn ghost small" onClick={() => withdraw(a._id)}>Withdraw</button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
