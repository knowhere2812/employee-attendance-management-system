import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";

const accessTokenFor = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, type: "access" },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    },
  );
const refreshTokenFor = (user) =>
  jwt.sign(
    { id: user._id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    },
  );
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
const refreshTokenLifetime = () =>
  Number(process.env.REFRESH_TOKEN_DAYS || 7) * 24 * 60 * 60 * 1000;
const issueTokens = async (user) => {
  const accessToken = accessTokenFor(user);
  const refreshToken = refreshTokenFor(user);
  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = new Date(Date.now() + refreshTokenLifetime());
  await user.save();
  return { accessToken, refreshToken };
};
const respondUser = async (res, user) => {
  const { accessToken, refreshToken } = await issueTokens(user);
  return res.status(200).json({
    token: accessToken,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      department: user.department,
      role: user.role,
      leaveBalance: user.leaveBalance,
      joiningDate: user.joiningDate,
    },
  });
};
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });
    const { name, email, password, employeeId, department, joiningDate, role } =
      req.body;
    if (await User.findOne({ $or: [{ email }, { employeeId }] }))
      return res
        .status(409)
        .json({ message: "Email or employee ID is already registered" });
    const user = await User.create({
      name,
      email,
      password,
      employeeId,
      department,
      joiningDate,
      role: role === "hr" ? "hr" : "employee",
    });
    await respondUser(res, user);
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    }).select("+password");
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive)
      return res.status(403).json({ message: "Account is disabled" });
    if (req.body.loginRole && user.role !== req.body.loginRole)
      return res.status(403).json({
        message: `This account is not registered as ${req.body.loginRole === "hr" ? "HR" : "an employee"}`,
      });
    await respondUser(res, user);
  } catch (e) {
    next(e);
  }
};
export const me = (req, res) => res.json({ user: req.user });

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token is required" });

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );
    if (decoded.type !== "refresh")
      return res.status(401).json({ message: "Invalid refresh token" });

    const user = await User.findById(decoded.id).select(
      "+refreshTokenHash +refreshTokenExpiresAt",
    );
    if (
      !user?.isActive ||
      !user.refreshTokenHash ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt <= new Date() ||
      user.refreshTokenHash !== hashToken(refreshToken)
    )
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });

    const tokens = await issueTokens(user);
    res.json(tokens);
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    )
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 },
    });
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
};
