import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const r = Router();
const creds = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];
r.post(
  "/register",
  [
    ...creds,
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("employeeId").trim().notEmpty().withMessage("Employee ID is required"),
    body("department").trim().notEmpty().withMessage("Department is required"),
    body("role")
      .optional()
      .isIn(["employee", "hr"])
      .withMessage("Choose a valid role"),
  ],
  register,
);
r.post(
  "/login",
  [
    ...creds,
    body("loginRole")
      .optional()
      .isIn(["employee", "hr"])
      .withMessage("Choose a valid login role"),
  ],
  login,
);
r.get("/me", protect, me);
export default r;
