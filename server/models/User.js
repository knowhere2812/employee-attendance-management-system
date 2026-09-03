import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    role: { type: String, enum: ["employee", "hr"], default: "employee" },
    joiningDate: { type: Date, default: Date.now },
    leaveBalance: { type: Number, default: 20, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};
export default mongoose.model("User", userSchema);
