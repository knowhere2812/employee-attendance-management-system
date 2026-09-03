import { Router } from 'express'; 
import { attendance, dashboard, decideLeave, employees, leaves } from '../controllers/hrController.js'; 
import { protect, allowRoles } from '../middleware/authMiddleware.js';
const r = Router(); r.use(protect, allowRoles('hr')); 
r.get('/dashboard', dashboard); 
r.get('/employees', employees); 
r.get('/attendance', attendance); 
r.get('/leaves', leaves); 
r.put('/leaves/:id/approve', (req, res, next) => { 
    req.params.decision = 'approve'; next(); 
}, decideLeave); 
r.put('/leaves/:id/reject', (req, res, next) => { 
    req.params.decision = 'reject'; next(); 
}, decideLeave); 
export default r;
