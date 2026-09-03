import { BarChart3, CalendarCheck, ClipboardList, LogOut, Menu, Users, X } from 'lucide-react'; 
import { NavLink, useNavigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react';
const employeeLinks = [
    { to:'/employee', label:'Dashboard', icon:BarChart3 },
    { to:'/employee/attendance', label:'Attendance', icon:CalendarCheck },
    { to:'/employee/leaves', label:'My Leaves', icon:ClipboardList }]; 
const hrLinks = [
        { to:'/hr', label:'Dashboard', icon:BarChart3 },
        { to:'/hr/employees', label:'Employees', icon:Users },
        { to:'/hr/attendance', label:'Attendance', icon:CalendarCheck },
        { to:'/hr/leaves', label:'Leave Requests', icon:ClipboardList }
    ];
export default function Layout({ children }) { 
    const { user, logout } = useAuth(); const nav = useNavigate(); 
    const [open, setOpen] = useState(false); const links = user.role === 'hr' ? hrLinks : employeeLinks; const close = () => setOpen(false); 
    return <div className="min-h-screen lg:flex">
        <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-20 rounded-lg bg-slate-900 p-2 text-white lg:hidden"><Menu size={20}/></button>
        <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 p-5 text-slate-300 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-10 flex items-center justify-between"><div>
                <p className="text-xl font-bold text-white">WorkTrack</p>
                <p className="text-xs text-slate-400">Attendance portal</p>
                </div>
                <button className="lg:hidden" onClick={close}><X/></button>
                </div>
                <nav className="space-y-2">{links.map(({to,label,icon:Icon}) => <NavLink end={to === '/employee' || to === '/hr'} key={to} to={to} onClick={close} className={({isActive}) => `flex items-center gap-3 rounded-lg px-3 py-3 ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Icon size={19}/>{label}</NavLink>)}
                </nav>
                <div className="mt-auto border-t border-slate-700 pt-4">
                    <p className="truncate font-medium text-white">{user.name}</p>
                    <p className="mb-3 text-xs">{user.department}</p>
                    <button onClick={() => { logout(); nav('/sign-in'); }} className="flex items-center gap-2 text-sm hover:text-white"><LogOut size={17}/> Sign out</button>
                </div>
                </aside>{open && <div onClick={close} className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"/>}<main className="min-w-0 flex-1 p-5 pt-20 lg:p-8">{children}</main>
                </div>; 
                }
