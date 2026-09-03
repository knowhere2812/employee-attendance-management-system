import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
export default function AuthPage({ register = false }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState("employee");
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = register
        ? { ...form, role: selectedRole }
        : { ...form, loginRole: selectedRole };
      const { data } = await api.post(
        register ? "/auth/register" : "/auth/login",
        payload,
      );
      login(data);
      nav(data.user.role === "hr" ? "/hr" : "/employee");
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to continue. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const roleLabel = selectedRole === "hr" ? "HR" : "Employee";
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>
          {!register && (
            <Link
              to="/register"
              className="text-sm font-medium text-brand-400 hover:text-brand-300"
            >
              Create account
            </Link>
          )}
        </div>
        <div className="mb-8 text-center text-white">
          <h1 className="text-3xl font-bold">WorkTrack</h1>
          <p className="mt-2 text-slate-400">Employee Attendance Management</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-white p-7 shadow-xl">
          <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 p-1">
            {["employee", "hr"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${selectedRole === role ? "bg-brand-600 text-white" : "text-slate-600 hover:text-slate-800"}`}
              >
                {role === "hr" ? "HR" : "Employee"}
              </button>
            ))}
          </div>
          <h2 className="text-2xl font-bold">
            {register ? "Create account" : `${roleLabel} sign in`}
          </h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            {register
              ? "Register to begin using the portal."
              : `Use your ${selectedRole === "hr" ? "HR" : "employee"} credentials to continue.`}
          </p>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {register && (
            <>
              <label className="mb-4 block text-sm font-medium">
                Full name
                <input
                  required
                  className="input mt-1"
                  name="name"
                  value={form.name}
                  onChange={update}
                />
              </label>
              <label className="mb-4 block text-sm font-medium">
                Employee ID
                <input
                  required
                  className="input mt-1"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={update}
                />
              </label>
              <label className="mb-4 block text-sm font-medium">
                Department
                <input
                  required
                  className="input mt-1"
                  name="department"
                  value={form.department}
                  onChange={update}
                />
              </label>
            </>
          )}
          <label className="mb-4 block text-sm font-medium">
            Email
            <input
              required
              type="email"
              className="input mt-1"
              name="email"
              value={form.email}
              onChange={update}
            />
          </label>
          <label className="mb-5 block text-sm font-medium">
            Password
            <input
              required
              minLength="8"
              type="password"
              className="input mt-1"
              name="password"
              value={form.password}
              onChange={update}
            />
          </label>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-600">
            {register ? "Already have an account?" : "New employee?"}{" "}
            <Link
              className="font-semibold text-brand-600"
              to={register ? "/sign-in" : "/register"}
            >
              {register ? "Sign in" : "Register"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
