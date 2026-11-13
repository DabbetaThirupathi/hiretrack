import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate } from "../../api";
import { BRANCHES } from "../Register.jsx";

const EMPTY = {
  company: "", role: "", description: "", ctc: "", location: "", jobType: "Full-time",
  minCgpa: 6, maxBacklogs: 0, graduationYear: "", branches: [], deadline: "", driveDate: "",
};

export default function ManageDrives() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api("/drives").then(setDrives).catch((e) => setMsg({ type: "error", text: e.message }));
  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const toggleBranch = (b) =>
    setForm({ ...form, branches: form.branches.includes(b) ? form.branches.filter((x) => x !== b) : [...form.branches, b] });

  const create = async (e) => {
    e.preventDefault();
    try {
      await api("/drives", {
        method: "POST",
        body: {
          company: form.company,
          role: form.role,
          description: form.description,
          ctc: Number(form.ctc),
          location: form.location,
          jobType: form.jobType,
          deadline: form.deadline,
          driveDate: form.driveDate || undefined,
          eligibility: {
            minCgpa: Number(form.minCgpa),
            maxBacklogs: Number(form.maxBacklogs),
            branches: form.branches,
            graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
          },
        },
      });
      setForm(EMPTY);
      setShowForm(false);
      setMsg({ type: "success", text: "Drive created" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const toggleStatus = async (d) => {
    await api(`/drives/${d._id}`, { method: "PUT", body: { status: d.status === "open" ? "closed" : "open" } });
    load();
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete ${d.company} drive and all its applications?`)) return;
    await api(`/drives/${d._id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>Manage drives</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New drive"}</button>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      {showForm && (
        <form className="card form grid-3" onSubmit={create}>
          <label>Company<input required value={form.company} onChange={set("company")} /></label>
          <label>Role<input required value={form.role} onChange={set("role")} /></label>
          <label>CTC (LPA)<input type="number" step="0.01" required value={form.ctc} onChange={set("ctc")} /></label>
          <label>Location<input value={form.location} onChange={set("location")} /></label>
          <label>Job type
            <select value={form.jobType} onChange={set("jobType")}>
              <option>Full-time</option><option>Internship</option><option>Internship + PPO</option>
            </select>
          </label>
          <label>Min CGPA<input type="number" step="0.1" value={form.minCgpa} onChange={set("minCgpa")} /></label>
          <label>Max backlogs<input type="number" min="0" value={form.maxBacklogs} onChange={set("maxBacklogs")} /></label>
          <label>Batch (optional)<input type="number" placeholder="2026" value={form.graduationYear} onChange={set("graduationYear")} /></label>
          <label>Deadline<input type="date" required value={form.deadline} onChange={set("deadline")} /></label>
          <label>Drive date<input type="date" value={form.driveDate} onChange={set("driveDate")} /></label>
          <div className="span-3">
            <div className="small muted">Eligible branches (none selected = all)</div>
            <div className="chips">
              {BRANCHES.map((b) => (
                <button type="button" key={b} className={`chip ${form.branches.includes(b) ? "on" : ""}`} onClick={() => toggleBranch(b)}>{b}</button>
              ))}
            </div>
          </div>
          <label className="span-3">Description<textarea rows={3} value={form.description} onChange={set("description")} /></label>
          <button className="btn span-3">Create drive</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead>
            <tr><th>Company</th><th>Role</th><th>CTC</th><th>Deadline</th><th>Applicants</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {drives.map((d) => (
              <tr key={d._id}>
                <td><b>{d.company}</b></td>
                <td>{d.role}</td>
                <td>{d.ctc} LPA</td>
                <td>{formatDate(d.deadline)}</td>
                <td><Link to={`/admin/drives/${d._id}`}>{d.applicants} view</Link></td>
                <td><span className={`badge ${d.status === "open" ? "status-selected" : "status-rejected"}`}>{d.status}</span></td>
                <td className="row-actions">
                  <button className="btn ghost small" onClick={() => toggleStatus(d)}>{d.status === "open" ? "Close" : "Reopen"}</button>
                  <button className="btn danger small" onClick={() => remove(d)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
