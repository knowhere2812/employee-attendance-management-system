import Leave from "../models/Leave.js";
import { validationResult } from "express-validator";
import { leaveDays } from "../utils/dateUtils.js";
export const applyLeave = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });
    const { startDate, endDate, leaveType, reason } = req.body;
    const days = leaveDays(startDate, endDate);
    if (days < 1 || days > 365)
      return res
        .status(400)
        .json({ message: "Please provide a valid leave date range" });
    const leave = await Leave.create({
      employee: req.user._id,
      startDate,
      endDate,
      leaveType,
      reason,
      days,
    });
    res.status(201).json({
      leave,
    });
  } catch (e) {
    next(e);
  }
};
export const myLeaves = async (req, res, next) => {
  try {
    res.json({
      leaves: await Leave.find({ employee: req.user._id }).sort({
        createdAt: -1,
      }),
    });
  } catch (e) {
    next(e);
  }
};
