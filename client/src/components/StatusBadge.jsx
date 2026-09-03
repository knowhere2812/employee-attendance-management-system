const colors = {
  Present: "bg-emerald-100 text-emerald-700",
  Late: "bg-amber-100 text-amber-700",
  "Half-Day": "bg-orange-100 text-orange-700",
  Absent: "bg-red-100 text-red-700",
  Leave: "bg-violet-100 text-violet-700",
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};
export default function StatusBadge({ status }) {
  return (
    <span
      className={`badge ${colors[status] || "bg-slate-100 text-slate-700"}`}
    >
      {status}
    </span>
  );
}
