import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === "admin" ? "/admin" : "/drives");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card card">
      <h1>Welcome back</h1>
      <p className="muted">Sign in to HireTrack</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit} className="form">
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="muted small">New student? <Link to="/register">Create an account</Link></p>
      <p className="muted small">Demo: admin@hiretrack.dev / admin123 · ananya@hiretrack.dev / student123</p>
    </div>
  );
}
