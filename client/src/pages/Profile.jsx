import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { BRANCHES } from "./Register.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    rollNo: user.rollNo || "",
    branch: user.branch || "IT",
    cgpa: user.cgpa ?? "",
    backlogs: user.backlogs ?? 0,
    graduationYear: user.graduationYear || "",
    phone: user.phone || "",
    skills: (user.skills || []).join(", "),
    resumeUrl: user.resumeUrl || "",
  });
  const [msg, setMsg] = useState(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const { user: updated } = await api("/auth/me", {
        method: "PUT",
        body: { ...form, cgpa: Number(form.cgpa), backlogs: Number(form.backlogs), graduationYear: Number(form.graduationYear) },
      });
      setUser(updated);
      setMsg({ type: "success", text: "Profile saved" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  return (
    <div className="card narrow">
      <h1>My profile</h1>
      <p className="muted">{user.email}</p>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      <form onSubmit={save} className="form grid-2">
        <label>Full name<input value={form.name} onChange={set("name")} /></label>
        <label>Roll number<input value={form.rollNo} onChange={set("rollNo")} /></label>
        <label>Branch
          <select value={form.branch} onChange={set("branch")}>{BRANCHES.map((b) => <option key={b}>{b}</option>)}</select>
        </label>
        <label>CGPA<input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={set("cgpa")} /></label>
        <label>Active backlogs<input type="number" min="0" value={form.backlogs} onChange={set("backlogs")} /></label>
        <label>Graduation year<input type="number" value={form.graduationYear} onChange={set("graduationYear")} /></label>
        <label>Phone<input value={form.phone} onChange={set("phone")} /></label>
        <label>Resume link<input type="url" placeholder="https://drive.google.com/..." value={form.resumeUrl} onChange={set("resumeUrl")} /></label>
        <label className="span-2">Skills (comma separated)<input value={form.skills} onChange={set("skills")} /></label>
        <button className="btn span-2">Save profile</button>
      </form>
    </div>
  );
}
