import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const formatHours = (minutes) => {
  const totalMinutes = Number(minutes) || 0;
  const hours = totalMinutes / 60;

  if (hours < 1) {
    return `${hours.toFixed(2)}h`;
  }

  const wholeHours = Math.floor(hours);
  const decimalPart = hours - wholeHours;
  if (decimalPart === 0) return `${wholeHours}h`;
  return `${wholeHours}.${decimalPart.toFixed(2).slice(2)}h`;
};

const normalizeSearch = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export function HrDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/hr/dashboard").then((r) => setData(r.data));
  }, []);
  if (!data) return <Loading />;
  const s = data.stats;
  return (
    <section>
      <h1 className="text-2xl font-bold">HR dashboard</h1>
      <p className="mt-1 text-slate-500">Today’s workforce overview.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Employees" value={s.totalEmployees} />
        <StatCard label="Present" value={s.present} color="text-emerald-600" />
        <StatCard label="Late" value={s.late} color="text-amber-600" />
        <StatCard label="Absent" value={s.absent} color="text-red-600" />
        <StatCard label="On leave" value={s.onLeave} color="text-violet-600" />
        <StatCard
          label="Avg hours"
          value={formatHours(s.avgWorkingHours)}
          color="text-cyan-600"
        />
      </div>
      <div className="card mt-6">
        <h2 className="font-bold">Monthly attendance</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="present" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
export function Employees() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    setError("");
    return api
      .get("/hr/employees")
      .then((r) => setItems(r.data.employees || []))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load employees."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const normalizedSearch = normalizeSearch(search);
  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return items;

    const terms = normalizedSearch.split(" ").filter(Boolean);

    return items.filter((employee) => {
      const searchableText = [
        employee.name,
        employee.email,
        employee.employeeId,
        employee.department,
        employee.role,
      ]
        .join(" ")
        .toLowerCase();

      return terms.every((term) => searchableText.includes(term));
    });
  }, [items, normalizedSearch]);

  if (loading) return <Loading />;
  return (
    <section>
      <h1 className="text-2xl font-bold">Employees</h1>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <div className="relative mt-5 max-w-md">
        <input
          aria-label="Search employees"
          className="input pr-12"
          placeholder="Search by name, ID, department or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        )}
      </div>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="p-3">Employee</th>
              <th>ID</th>
              <th>Department</th>
              <th>Email</th>
              <th>Working hours</th>
              <th>Leave balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((x) => (
              <tr className="border-b" key={x._id}>
                <td className="p-3 font-medium">{x.name}</td>
                <td>{x.employeeId}</td>
                <td>{x.department}</td>
                <td>{x.email}</td>
                <td>{formatHours(x.workingMinutes)}</td>
                <td>{x.leaveBalance} days</td>
              </tr>
            ))}
            {!filteredItems.length && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">
                  No employees match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function HrAttendance() {
  const [records, setRecords] = useState([]),
    [filters, setFilters] = useState({ date: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = (f) => {
    setLoading(true);
    setError("");
    return api
      .get("/hr/attendance", { params: f })
      .then((r) => setRecords(r.data.attendance || []))
      .catch((e) =>
        setError(
          e.response?.data?.message || "Could not load attendance records.",
        ),
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load(filters);
  }, []);
  if (loading) return <Loading />;
  return (
    <section>
      <h1 className="text-2xl font-bold">Attendance records</h1>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="date"
          className="input w-auto"
          value={filters.date}
          onChange={(e) => {
            const f = { ...filters, date: e.target.value };
            setFilters(f);
            load(f);
          }}
        />
        <select
          className="input w-auto"
          value={filters.status}
          onChange={(e) => {
            const f = { ...filters, status: e.target.value };
            setFilters(f);
            load(f);
          }}
        >
          <option value="">All statuses</option>
          {["Present", "Late", "Half-Day"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="p-3">Employee</th>
              <th>Date</th>
              <th>Department</th>
              <th>Working minutes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr className="border-b" key={r._id}>
                <td className="p-3 font-medium">{r.employee?.name}</td>
                <td>{r.date}</td>
                <td>{r.employee?.department}</td>
                <td>{r.workingMinutes}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No matching attendance records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function HrLeaves() {
  const [leaves, setLeaves] = useState([]),
    [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = (s) => {
    setLoading(true);
    return api
      .get("/hr/leaves", { params: { status: s } })
      .then((r) => setLeaves(r.data.leaves || []))
      .catch((e) =>
        setMessage(
          e.response?.data?.message || "Could not load leave requests.",
        ),
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load(status);
  }, []);
  const decide = async (id, choice) => {
    try {
      await api.put(`/hr/leaves/${id}/${choice}`);
      setMessage(`Leave request ${choice}d.`);
      load(status);
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not update request.");
    }
  };
  if (loading) return <Loading />;
  return (
    <section>
      <h1 className="text-2xl font-bold">Leave requests</h1>
      {message && (
        <p className="mt-4 rounded-lg bg-brand-50 p-3 text-brand-700">
          {message}
        </p>
      )}
      <select
        className="input mt-5 w-auto"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          load(e.target.value);
        }}
      >
        <option value="">All requests</option>
        {["Pending", "Approved", "Rejected"].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="p-3">Employee</th>
              <th>Dates</th>
              <th>Type</th>
              <th>Days</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr className="border-b" key={l._id}>
                <td className="p-3">
                  <p className="font-medium">{l.employee?.name}</p>
                  <p className="text-xs text-slate-500">
                    {l.employee?.employeeId}
                  </p>
                </td>
                <td>
                  {l.startDate} to {l.endDate}
                </td>
                <td>{l.leaveType}</td>
                <td>{l.days}</td>
                <td>
                  <StatusBadge status={l.status} />
                </td>
                <td>
                  {l.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(l._id, "approve")}
                        className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decide(l._id, "reject")}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!leaves.length && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
