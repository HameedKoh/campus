import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { adminRouter } from "./routes/admin.routes";
import { appointmentRouter } from "./routes/appointment.routes";
import { assessmentRouter } from "./routes/assessment.routes";
import { authRouter } from "./routes/auth.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { emergencyRouter } from "./routes/emergency.routes";
import { recordRouter } from "./routes/record.routes";
import { userRouter } from "./routes/user.routes";
import { errorHandler, notFound } from "./middleware/error-handler";

export function createApp() {
  const app = express();
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
  });
  const assessmentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
  });

  app.use(
    cors({
      origin: env.FRONTEND_URL
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "Campus SmartCare API"
    });
  });

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/users", userRouter);
  app.use("/api/assessments", assessmentLimiter, assessmentRouter);
  app.use("/api/appointments", appointmentRouter);
  app.use("/api/emergencies", emergencyRouter);
  app.use("/api/records", recordRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
