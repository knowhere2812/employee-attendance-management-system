export default function StatCard(
    {label, value, color='text-brand-600'}){ 
    return <div className="card"><p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>; 
}
