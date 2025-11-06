import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandlerMiddleware from "./middlewares/ErrorHandlerMiddleware.js";

// Import Routes
import AuthRouter from "./routes/auth.js";
import ServiceRouter from "./routes/service.js";
import CarRouter from "./routes/car.js";
import BookRouter from "./routes/book.js";
import UserRouter from "./routes/user.js";
import PartRouter from "./routes/part.js";
import LogsRouter from "./routes/logs.js";
import JobRouter from "./routes/jobs.js";
import QuoteRouter from "./routes/quotes.js";
import BillingRouter from "./routes/billing.js";
import DashboardRouter from "./routes/dashboard.js";
import PackRouter from "./routes/pack.js";  // Correct import for your packs route
import NotificationRouter from "./routes/notifications.js"

dotenv.config();

export const prisma = new PrismaClient();
const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use("/api/auth", AuthRouter);
app.use("/api/services", ServiceRouter);
app.use("/api/cars", CarRouter);
app.use("/api/bookings", BookRouter);
app.use("/api/users", UserRouter);
app.use("/api/parts", PartRouter);
app.use("/api/jobs", JobRouter);
app.use("/api/inventory/logs", LogsRouter);
app.use("/api/quotes", QuoteRouter);
app.use("/api/billings", BillingRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/packs", PackRouter);  // Add this line to mount your Pack routes
app.use("/api/notifications", NotificationRouter)

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Global error handler middleware
app.use(errorHandlerMiddleware);

// Start the server
app.listen(5000, () => {
  console.log("server running...");
});
