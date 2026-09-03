import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import {
  AttendanceHistory,
  EmployeeDashboard,
  MyLeaves,
} from "./pages/EmployeePages";
import {
  Employees,
  HrAttendance,
  HrDashboard,
  HrLeaves,
} from "./pages/HrPages";
function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/sign-in" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === "hr" ? "/hr" : "/employee"} replace />;
  return <Layout>{children}</Layout>;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route
        path="/employee"
        element={
          <Protected role="employee">
            <EmployeeDashboard />
          </Protected>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <Protected role="employee">
            <AttendanceHistory />
          </Protected>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <Protected role="employee">
            <MyLeaves />
          </Protected>
        }
      />
      <Route
        path="/hr"
        element={
          <Protected role="hr">
            <HrDashboard />
          </Protected>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <Protected role="hr">
            <Employees />
          </Protected>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <Protected role="hr">
            <HrAttendance />
          </Protected>
        }
      />
      <Route
        path="/hr/leaves"
        element={
          <Protected role="hr">
            <HrLeaves />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
