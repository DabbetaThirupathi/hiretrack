import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Drives from "./pages/Drives.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import ManageDrives from "./pages/admin/ManageDrives.jsx";
import DriveApplicants from "./pages/admin/DriveApplicants.jsx";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/drives"} replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="center muted">Loading...</div>;

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/drives" element={<Drives />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/drives" element={<ManageDrives />} />
            <Route path="/admin/drives/:id" element={<DriveApplicants />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
