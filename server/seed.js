import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import User from "./models/User.js";
import Attendance from "./models/Attendance.js";
import { kolkataDate } from "./utils/dateUtils.js";
if (process.env.DNS_SERVERS)
  dns.setServers(
    process.env.DNS_SERVERS.split(",")
      .map((server) => server.trim())
      .filter(Boolean),
  );
try {
  await mongoose.connect(process.env.MONGO_URI);
  const password = "Password123!";
  const hr = await User.findOneAndUpdate(
    { email: "hr@company.com" },
    {
      name: "Priya Sharma",
      email: "hr@company.com",
      employeeId: "HR-001",
      department: "Human Resources",
      role: "hr",
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (!hr.password) {
    hr.password = password;
    await hr.save();
  }
  const employee = await User.findOneAndUpdate(
    { email: "employee@company.com" },
    {
      name: "Rahul Verma",
      email: "employee@company.com",
      employeeId: "EMP-001",
      department: "Engineering",
      role: "employee",
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (!employee.password) {
    employee.password = password;
    await employee.save();
  }
  await Attendance.updateOne(
    { employee: employee._id, date: kolkataDate() },
    {
      $setOnInsert: {
        employee: employee._id,
        date: kolkataDate(),
        status: "Present",
        checkIn: new Date(),
        workingMinutes: 0,
      },
    },
    { upsert: true },
  );
  console.log("Demo users created.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
