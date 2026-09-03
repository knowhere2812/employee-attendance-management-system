import Attendance from '../models/Attendance.js'; 
import { kolkataDate, isLate } from '../utils/dateUtils.js';
export const checkIn = async (req, res, next) => { 
    try { const date = kolkataDate(); 
        if (
            await Attendance.findOne({ 
                employee: req.user._id, date 
            })) 
            return res.status(409).json({ message: 'You have already checked in today' }); 
            const attendance = await Attendance.create({ 
                employee: req.user._id, date, checkIn: new Date(), status: isLate() ? 'Late' : 'Present' 
            }); 
            res.status(201).json({ attendance }); 
        } catch (e) {
             next(e); 
            } 
        };
export const checkOut = async (req, res, next) => { 
    try { 
        const attendance = await Attendance.findOne({ 
            employee: req.user._id, date: kolkataDate() 
        }); 
        if (!attendance?.checkIn) return res.status(400).json({ 
            message: 'Check in before checking out' }); 
            if (attendance.checkOut) 
                return res.status(409).json({ message: 'You have already checked out today' }); 
            attendance.checkOut = new Date(); 
            attendance.workingMinutes = Math.max(0, Math.floor((attendance.checkOut - attendance.checkIn) / 60000)); 
            if (attendance.workingMinutes < 240) attendance.status = 'Half-Day'; 
            await attendance.save(); 
            res.json({ attendance }); 
        } catch (e) { 
            next(e); 
        } 
    };
export const today = async (req, res, next) => { 
    try { 
        res.json(
            { 
            attendance: await Attendance.findOne(
                { employee: req.user._id, date: kolkataDate() 
            }
        ) 
    }); 
} catch (e) { 
    next(e); 
} 
};
export const history = async (req, res, next) => { 
    try { 
        const page = Math.max(1, Number(req.query.page) || 1); 
        const limit = Math.min(50, Number(req.query.limit) || 20); 
        const filter = { employee: req.user._id }; c
        onst [attendance, total] = await Promise.all(
            [Attendance.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit), Attendance.countDocuments(filter)]); 
            res.json({ 
                attendance, total, page, pages: Math.ceil(total / limit) 
            }); 
        } catch (e) { 
            next(e); 
        } };
