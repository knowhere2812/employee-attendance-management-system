import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import { kolkataDate } from '../utils/dateUtils.js';

export const dashboard = async (req, res, next) => {
  try {
    const date = kolkataDate();
    const monthStart = `${date.slice(0, 7)}-01`;

    const [totalEmployees, todayAttendance, onLeave, monthly, monthlyHours] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true }),
      Attendance.find({ date }),
      Leave.countDocuments({ status: 'Approved', startDate: { $lte: date }, endDate: { $gte: date } }),
      Attendance.aggregate([
        { $match: { employee: { $ne: null }, date: { $gte: monthStart, $lte: date } } },
        { $group: { _id: '$date', present: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] } }, late: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } } } },
        { $sort: { _id: 1 } }
      ]),
      Attendance.aggregate([
        { $match: { employee: { $ne: null }, date: { $gte: monthStart, $lte: date } } },
        { $group: { _id: null, totalMinutes: { $sum: '$workingMinutes' }, records: { $sum: 1 } } }
      ])
    ]);

    const present = todayAttendance.filter(a => ['Present', 'Late'].includes(a.status)).length;
    const late = todayAttendance.filter(a => a.status === 'Late').length;
    const averageWorkingMinutes = monthlyHours[0]?.records ? monthlyHours[0].totalMinutes / monthlyHours[0].records : 0;
    const averageWorkingHours = averageWorkingMinutes / 60;

    res.json({
      stats: {
        totalEmployees,
        present,
        late,
        absent: Math.max(0, totalEmployees - present - onLeave),
        onLeave,
        avgWorkingHours: averageWorkingHours
      },
      monthly
    });
  } catch (e) {
    next(e);
  }
};

export const employees = async (req, res, next) => {
  try {
    const search = req.query.search?.trim();
    const filter = { role: 'employee' };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') }
      ];
    }

    const date = kolkataDate();
    const monthStart = `${date.slice(0, 7)}-01`;

    const [employees, summary] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }),
      Attendance.aggregate([
        { $match: { employee: { $ne: null }, date: { $gte: monthStart, $lte: date } } },
        { $group: { _id: '$employee', workingMinutes: { $sum: '$workingMinutes' } } }
      ])
    ]);

    const totals = Object.fromEntries(summary.map(item => [String(item._id), item.workingMinutes || 0]));

    res.json({
      employees: employees.map(employee => ({
        ...employee.toObject(),
        workingMinutes: totals[String(employee._id)] || 0
      }))
    });
  } catch (e) {
    next(e);
  }
};

export const attendance = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const records = await Attendance.find(filter)
      .populate('employee', 'name employeeId department')
      .sort({ date: -1, createdAt: -1 })
      .limit(200);

    res.json({ attendance: records });
  } catch (e) {
    next(e);
  }
};

export const leaves = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    res.json({
      leaves: await Leave.find(filter)
        .populate('employee', 'name employeeId department leaveBalance')
        .sort({ createdAt: -1 })
    });
  } catch (e) {
    next(e);
  }
};

export const decideLeave = async (req, res, next) => {
  try {
    const approved = req.params.decision === 'approve';
    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      { $set: { status: approved ? 'Approved' : 'Rejected' } },
      { new: true }
    );

    if (!leave) {
      const exists = await Leave.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        message: exists ? 'This leave request has already been processed' : 'Leave request not found'
      });
    }

    if (approved) {
      const user = await User.findOneAndUpdate(
        { _id: leave.employee, leaveBalance: { $gte: leave.days } },
        { $inc: { leaveBalance: -leave.days } },
        { new: true }
      );

      if (!user) {
        await Leave.updateOne({ _id: leave._id, status: 'Approved' }, { $set: { status: 'Pending' } });
        return res.status(400).json({ message: 'Employee does not have enough leave balance' });
      }
    }

    res.json({ leave });
  } catch (e) {
    next(e);
  }
};
