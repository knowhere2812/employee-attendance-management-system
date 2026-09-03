import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "—";
const hours = (mins) =>
  mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "—";
export function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    return api
      .get("/attendance/today")
      .then((r) => setData(r.data.attendance))
      .catch(() => setError("Could not load today’s attendance."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  const action = async (endpoint) => {
    setBusy(true);
    setError("");
    try {
      await api.post(endpoint);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <Loading />;
  return (
    <section>
      <h1 className="text-2xl font-bold">
        Good day, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-slate-500">Track today’s work and attendance.</p>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Leave balance" value={`${user.leaveBalance} days`} />
        <StatCard
          label="Check-in"
          value={formatTime(data?.checkIn)}
          color="text-emerald-600"
        />
        <StatCard
          label="Working time"
          value={hours(data?.workingMinutes)}
          color="text-violet-600"
        />
      </div>
      <div className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Today’s attendance</h2>
            <p className="mt-1 text-sm text-slate-500">
              Office starts at 9:30 AM (Asia/Kolkata)
            </p>
          </div>
          {data && <StatusBadge status={data.status} />}
        </div>
        <div className="mt-5 flex gap-3">
          {!data?.checkIn && (
            <button
              disabled={busy}
              onClick={() => action("/attendance/check-in")}
              className="btn-primary"
            >
              Check in
            </button>
          )}
          {data?.checkIn && !data?.checkOut && (
            <button
              disabled={busy}
              onClick={() => action("/attendance/check-out")}
              className="btn-primary"
            >
              Check out
            </button>
          )}
          {data?.checkOut && (
            <p className="font-medium text-emerald-700">
              You have completed today’s attendance.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
export function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/attendance/my-history")
      .then((r) => setRecords(r.data.attendance || []))
      .catch((e) =>
        setError(
          e.response?.data?.message || "Could not load attendance history.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Loading />;
  return (
    <section>
      <h1 className="text-2xl font-bold">Attendance history</h1>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Check-in</th>
              <th className="p-3">Check-out</th>
              <th className="p-3">Working time</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b last:border-0">
                <td className="p-3 font-medium">{r.date}</td>
                <td>{formatTime(r.checkIn)}</td>
                <td>{formatTime(r.checkOut)}</td>
                <td>{hours(r.workingMinutes)}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan="5">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    leaveType: "Casual",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const load = () => {
    setLoading(true);
    return api
      .get("/leaves/my-leaves")
      .then((r) => setLeaves(r.data.leaves || []))
      .catch((e) =>
        setMessage(
          e.response?.data?.message || "Could not load leave requests.",
        ),
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/leaves", form);
      setMessage("Leave request submitted.");
      setForm({ startDate: "", endDate: "", leaveType: "Casual", reason: "" });
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to submit request.");
    }
  };
  if (loading) return <Loading />;
  return (
    <section>
      <h1 className="text-2xl font-bold">My leave requests</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="card">
          <h2 className="font-bold">Apply for leave</h2>
          {message && (
            <p className="mt-3 rounded bg-brand-50 p-2 text-sm text-brand-700">
              {message}
            </p>
          )}
          <label className="mt-4 block text-sm">
            Start date
            <input
              required
              type="date"
              className="input mt-1"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label className="mt-3 block text-sm">
            End date
            <input
              required
              type="date"
              className="input mt-1"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <label className="mt-3 block text-sm">
            Type
            <select
              className="input mt-1"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            >
              {["Casual", "Sick", "Annual", "Other"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm">
            Reason
            <textarea
              required
              className="input mt-1"
              rows="3"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </label>
          <button className="btn-primary mt-4 w-full">Submit request</button>
        </form>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="p-3">Dates</th>
                <th>Type</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr className="border-b" key={l._id}>
                  <td className="p-3">
                    {l.startDate} to {l.endDate}
                  </td>
                  <td>{l.leaveType}</td>
                  <td>{l.days}</td>
                  <td>{l.reason}</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
              {!leaves.length && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">
                    No leave requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
