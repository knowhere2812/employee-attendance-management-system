import { Router } from "express";
import { body } from "express-validator";
import { applyLeave, myLeaves } from "../controllers/leaveController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
const r = Router();
r.use(protect, allowRoles("employee"));
r.post(
  "/",
  [
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("leaveType").isIn(["Casual", "Sick", "Annual", "Other"]),
    body("reason").trim().notEmpty().withMessage("Reason is required"),
  ],
  applyLeave,
);
r.get("/my-leaves", myLeaves);
export default r;
