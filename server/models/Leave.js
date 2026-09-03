import mongoose from "mongoose";
const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ["Casual", "Sick", "Annual", "Other"],
      required: true,
    },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    days: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true },
);
export default mongoose.model("Leave", leaveSchema);
