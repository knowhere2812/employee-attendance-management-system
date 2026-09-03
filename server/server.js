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
let databaseConnection;

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }
  if (mongoose.connection.readyState === 1) return;
  if (!databaseConnection) {
    databaseConnection = mongoose
      .connect(process.env.MONGO_URI)
      .catch((error) => {
        databaseConnection = undefined;
        throw error;
      });
  }
  await databaseConnection;
};

if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(",")
      .map((server) => server.trim())
      .filter(Boolean),
  );
}
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/hr", hrRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  connectDatabase()
    .then(() =>
      app.listen(port, () => console.log(`Server running on ${port}`)),
    )
    .catch((error) => {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    });
}

export default app;
