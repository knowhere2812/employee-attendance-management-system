import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import dns from "node:dns";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(",")
      .map((server) => server.trim())
      .filter(Boolean),
  );
}
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/api/health", (req, res) => res.json({ message: "API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/hr", hrRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`Server running on ${port}`)))
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
