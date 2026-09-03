import { createContext, useContext, useEffect, useState } from 'react'; 
import api from '../services/api';
const AuthContext = createContext(); 
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) { const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('attendance_user') || 'null')); 
const [loading, setLoading] = useState(true); 
useEffect(() => { 
    if (!localStorage.getItem('attendance_token')) return setLoading(false); api.get('/auth/me').then(({ data }) => { setUser(data.user); 
        localStorage.setItem('attendance_user', JSON.stringify(data.user)); 
    }).catch(() => { 
        localStorage.removeItem('attendance_token'); 
        localStorage.removeItem('attendance_user'); setUser(null); }).finally(() => setLoading(false)); }, []); 
        const login = data => { localStorage.setItem('attendance_token', data.token); 
        localStorage.setItem('attendance_user', JSON.stringify(data.user)); 
        setUser(data.user); }; 
        const logout = () => { 
            localStorage.removeItem('attendance_token'); 
            localStorage.removeItem('attendance_user'); setUser(null); 
        }; 
        return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>; }
