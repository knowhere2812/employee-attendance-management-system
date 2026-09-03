import mongoose from 'mongoose';
const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkIn: Date, checkOut: Date,
  workingMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Late', 'Half-Day', 'Absent', 'Leave'], default: 'Present' }
}, { timestamps: true });
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
export default mongoose.model('Attendance', attendanceSchema);
