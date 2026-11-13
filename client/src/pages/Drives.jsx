import { useEffect, useState } from "react";
import { api, formatDate } from "../api";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api(`/drives?search=${encodeURIComponent(search)}`)
      .then(setDrives)
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const apply = async (drive) => {
    setMessage(null);
    try {
      await api("/applications", { method: "POST", body: { driveId: drive._id } });
      setMessage({ type: "success", text: `Applied to ${drive.company} - ${drive.role}` });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const visible = onlyEligible ? drives.filter((d) => d.eligibilityCheck?.eligible) : drives;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Placement drives</h1>
          <p className="muted">Eligibility is checked automatically against your profile.</p>
        </div>
        <div className="filters">
          <input placeholder="Search company, role, location" value={search} onChange={(e) => setSearch(e.target.value)} />
          <label className="check"><input type="checkbox" checked={onlyEligible} onChange={(e) => setOnlyEligible(e.target.checked)} /> Eligible only</label>
        </div>
      </div>

      {message && <div className={`alert ${message.type}`}>{message.text}</div>}
      {loading && <p className="muted">Loading drives...</p>}
      {!loading && !visible.length && <p className="muted">No drives found.</p>}

      <div className="cards">
        {visible.map((d) => (
          <article key={d._id} className="card drive">
            <div className="drive-top">
              <div>
                <h3>{d.company}</h3>
                <div className="muted">{d.role} · {d.location || "Remote"} · {d.jobType}</div>
              </div>
              <div className="ctc">{d.ctc} LPA</div>
            </div>
            {d.description && <p className="desc">{d.description}</p>}
            <div className="meta">
              <span>Min CGPA: <b>{d.eligibility?.minCgpa || "None"}</b></span>
              <span>Branches: <b>{d.eligibility?.branches?.length ? d.eligibility.branches.join(", ") : "All"}</b></span>
              <span>Deadline: <b>{formatDate(d.deadline)}</b></span>
            </div>
            <div className="drive-foot">
              {d.applicationStatus ? (
                <StatusBadge status={d.applicationStatus} />
              ) : d.eligibilityCheck?.eligible ? (
                <button className="btn" onClick={() => apply(d)}>Apply now</button>
              ) : (
                <div className="not-eligible">
                  <span className="badge status-rejected">Not eligible</span>
                  <ul>{d.eligibilityCheck?.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
