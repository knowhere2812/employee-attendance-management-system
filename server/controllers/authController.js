import jwt from 'jsonwebtoken'; 
import { validationResult } from 'express-validator'; 
import User from '../models/User.js';

const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const respondUser = (res, user) => res.status(200).json({ token: tokenFor(user._id), user: { id: user._id, name: user.name, email: user.email, employeeId: user.employeeId, department: user.department, role: user.role, leaveBalance: user.leaveBalance, joiningDate: user.joiningDate } });
export const register = async (req, res, next) => { 
    try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty())
         return res.status(400).json({ message: errors.array()[0].msg });
const { name, email, password, employeeId, department, joiningDate, role } = req.body;
if (await User.findOne({ $or: [{ email }, { employeeId }] })) return res.status(409).json({ message: 'Email or employee ID is already registered' }); 
const user = await User.create({ name, email, password, employeeId, department, joiningDate, role: role === 'hr' ? 'hr' : 'employee' });
respondUser(res, user);
 } catch (e) { next(e);
  } 
};

export const login = async (req, res, next) => { try { const errors = validationResult(req); 
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
if (!user || !(await user.matchPassword(req.body.password))) return res.status(401).json({ message: 'Invalid email or password' }); 
if (!user.isActive) return res.status(403).json({ message: 'Account is disabled' }); 
if (req.body.loginRole && user.role !== req.body.loginRole) return res.status(403).json({ message: `This account is not registered as ${req.body.loginRole === 'hr' ? 'HR' : 'an employee'}` }); 
respondUser(res, user); } catch (e) { next(e); } };
export const me = (req, res) => res.json({ user: req.user });
