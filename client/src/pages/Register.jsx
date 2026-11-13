import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIML", "DS"];

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", rollNo: "", branch: "IT", cgpa: "", backlogs: 0, graduationYear: 2026,
  });
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register({
        ...form,
        cgpa: Number(form.cgpa),
        backlogs: Number(form.backlogs),
        graduationYear: Number(form.graduationYear),
      });
      navigate("/drives");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card card wide">
      <h1>Student registration</h1>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit} className="form grid-2">
        <label>Full name<input required value={form.name} onChange={set("name")} /></label>
        <label>Roll number<input required value={form.rollNo} onChange={set("rollNo")} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set("email")} /></label>
        <label>Password<input type="password" minLength={6} required value={form.password} onChange={set("password")} /></label>
        <label>Branch
          <select value={form.branch} onChange={set("branch")}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label>CGPA<input type="number" step="0.01" min="0" max="10" required value={form.cgpa} onChange={set("cgpa")} /></label>
        <label>Active backlogs<input type="number" min="0" value={form.backlogs} onChange={set("backlogs")} /></label>
        <label>Graduation year<input type="number" value={form.graduationYear} onChange={set("graduationYear")} /></label>
        <button className="btn span-2">Create account</button>
      </form>
      <p className="muted small">Already registered? <Link to="/login">Sign in</Link></p>
    </div>
  );
}
