import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = !user
    ? []
    : user.role === "admin"
      ? [["/admin", "Dashboard"], ["/admin/drives", "Drives"]]
      : [["/drives", "Drives"], ["/applications", "My Applications"], ["/profile", "Profile"]];

  return (
    <header className="navbar">
      <div className="brand">
        <span className="logo">HT</span> HireTrack
      </div>
      <nav>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? "active" : "")}>
            {label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="user">
          <span className="muted">{user.name}</span>
          <button
            className="btn ghost"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
