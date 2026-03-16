import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import taskRouter from "./routes/task.js";
import teamRouter from "./routes/team.js";
import commentRouter from "./routes/comment.js";
import { requireAuth } from "./middleware/auth.js";

// Load environment variables from .env
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json());

// --- Routes ---
app.use("/api/tasks", requireAuth, taskRouter);
app.use("/api/tasks/:taskId/comments", requireAuth, commentRouter);
app.use("/api/team", requireAuth, teamRouter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// --- 404 handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// --- Global error handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
