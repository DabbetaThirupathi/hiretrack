import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";

const STATUSES = ["applied", "shortlisted", "interview", "selected", "rejected"];

// Builds a CSV file in the browser and downloads it.
function downloadCsv(drive, apps) {
  const header = ["Name", "Roll No", "Email", "Branch", "CGPA", "Backlogs", "Phone", "Status"];
  const rows = apps.map((a) => [a.student?.name, a.student?.rollNo, a.student?.email, a.student?.branch, a.student?.cgpa, a.student?.backlogs, a.student?.phone, a.status]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${drive.company}-${drive.role}-applicants.csv`.replace(/\s+/g, "_");
  link.click();
  URL.revokeObjectURL(url);
}

export default function DriveApplicants() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api(`/applications/drive/${id}${filter ? `?status=${filter}` : ""}`).then(setApps).catch((e) => setError(e.message));
    setSelected([]);
  };

  useEffect(() => {
    api(`/drives/${id}`).then(setDrive).catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [id, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateOne = async (appId, status) => {
    await api(`/applications/${appId}/status`, { method: "PATCH", body: { status } });
    load();
  };

  const bulkUpdate = async (status) => {
    await api("/applications/bulk-status", { method: "PATCH", body: { ids: selected, status } });
    load();
  };

  const toggle = (appId) => setSelected(selected.includes(appId) ? selected.filter((x) => x !== appId) : [...selected, appId]);

  if (error) return <div className="alert error">{error}</div>;
  if (!drive) return <p className="muted">Loading...</p>;

  return (
    <>
      <Link to="/admin/drives" className="small">&larr; All drives</Link>
      <div className="page-head">
        <div>
          <h1>{drive.company} · {drive.role}</h1>
          <p className="muted">{apps.length} applicant(s) · {drive.ctc} LPA</p>
        </div>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn ghost" onClick={() => downloadCsv(drive, apps)} disabled={!apps.length}>Export CSV</button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="card bulk">
          <b>{selected.length} selected</b> - move to:
          {STATUSES.map((s) => (
            <button key={s} className="btn ghost small" onClick={() => bulkUpdate(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={apps.length > 0 && selected.length === apps.length} onChange={(e) => setSelected(e.target.checked ? apps.map((a) => a._id) : [])} /></th>
              <th>Student</th><th>Roll No</th><th>Branch</th><th>CGPA</th><th>Skills</th><th>Resume</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a._id}>
                <td><input type="checkbox" checked={selected.includes(a._id)} onChange={() => toggle(a._id)} /></td>
                <td><b>{a.student?.name}</b><div className="small muted">{a.student?.email}</div></td>
                <td>{a.student?.rollNo}</td>
                <td>{a.student?.branch}</td>
                <td>{a.student?.cgpa}</td>
                <td className="small">{a.student?.skills?.join(", ")}</td>
                <td>{a.student?.resumeUrl ? <a href={a.student.resumeUrl} target="_blank" rel="noreferrer">Open</a> : "-"}</td>
                <td>
                  <select className={`status-select status-${a.status}`} value={a.status} onChange={(e) => updateOne(a._id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!apps.length && <tr><td colSpan={8} className="muted center">No applicants.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
