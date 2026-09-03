import { BarChart3, CalendarCheck, ClipboardCheck, ShieldCheck, Users, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const features = [
  { icon: CalendarCheck, title: 'Simple attendance', text: 'Check in, check out, and keep an accurate record of every workday.' },
  { icon: ClipboardCheck, title: 'Leave management', text: 'Apply for leave and track approvals and remaining balance in one place.' },
  { icon: BarChart3, title: 'Clear HR insights', text: 'Review attendance, employee status, and leave requests from one dashboard.' }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  const goToLogin = () => {
    setRolePickerOpen(false);
    navigate('/sign-in');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="text-xl font-bold">WorkTrack</Link>
        <div className="relative flex items-center gap-3">
          <button onClick={() => setRolePickerOpen(open => !open)} className="text-sm font-medium text-slate-200 hover:text-white">
            Sign in
          </button>

          {rolePickerOpen && (
            <div className="absolute right-0 top-12 z-10 w-52 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Choose role</p>
                <button type="button" onClick={() => setRolePickerOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={goToLogin} className="flex w-full items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700">
                  <span>Employee</span>
                  <Users size={16} />
                </button>
                <button type="button" onClick={goToLogin} className="flex w-full items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700">
                  <span>HR</span>
                  <ShieldCheck size={16} />
                </button>
              </div>
            </div>
          )}

          <Link to="/register" className="btn-primary">Get started</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.2fr_.8fr] md:items-center">
        <div>
          <p className="mb-4 font-semibold text-brand-500">EMPLOYEE ATTENDANCE MANAGEMENT</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">Work attendance, made clear.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A focused workspace for employees to manage their day and for HR teams to make confident people decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={goToLogin} className="btn-primary">Go to dashboard</button>
            <Link to="/register" className="btn-secondary border-slate-600 bg-transparent text-white hover:bg-slate-800">Create employee account</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Today’s overview</p>
              <p className="mt-1 text-2xl font-bold">Team attendance</p>
            </div>
            <div className="rounded-xl bg-brand-600 p-3"><Users size={24} /></div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Present</p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">—</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">On leave</p>
              <p className="mt-2 text-3xl font-bold text-violet-400">—</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-400">Sign in to see your live workforce data.</p>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-slate-800">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Why teams use WorkTrack</p>
            <h2 className="mt-3 text-3xl font-bold">Built for daily work clarity.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-xl bg-brand-100 p-3 text-brand-700">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
