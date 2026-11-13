import { useEffect, useState } from "react";
import { api } from "../../api";

function Stat({ label, value, sub }) {
  return (
    <div className="card stat">
      <div className="stat-val">{value}</div>
      <div className="muted">{label}</div>
      {sub && <div className="small muted">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/stats").then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!s) return <p className="muted">Loading dashboard...</p>;

  const pipeline = ["applied", "shortlisted", "interview", "selected", "rejected"];

  return (
    <>
      <h1>Placement dashboard</h1>
      <div className="stats">
        <Stat label="Students placed" value={`${s.placedStudents}/${s.totalStudents}`} sub={`${s.placementRate}% placement rate`} />
        <Stat label="Average package" value={`${s.avgCtc} LPA`} />
        <Stat label="Highest package" value={`${s.highestCtc} LPA`} />
        <Stat label="Drives" value={s.totalDrives} sub={`${s.openDrives} open now`} />
        <Stat label="Applications" value={s.totalApplications} />
      </div>

      <div className="grid-2 gap">
        <div className="card">
          <h3>Branch-wise placement</h3>
          {s.branchWise.map((b) => (
            <div key={b.branch} className="bar-row">
              <span className="bar-label">{b.branch}</span>
              <div className="bar"><div style={{ width: `${b.percentage}%` }} /></div>
              <span className="small">{b.placed}/{b.total} ({b.percentage}%)</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>Application pipeline</h3>
          {pipeline.map((p) => (
            <div key={p} className="pipe-row">
              <span className={`badge status-${p}`}>{p}</span>
              <b>{s.statusCounts[p] || 0}</b>
            </div>
          ))}
          <h3>Top recruiters</h3>
          {!s.topCompanies.length && <p className="muted small">No offers yet.</p>}
          {s.topCompanies.map((c) => (
            <div key={c.company} className="pipe-row">
              <span>{c.company}</span>
              <span className="small muted">{c.hires} hire(s) · {c.ctc} LPA</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
