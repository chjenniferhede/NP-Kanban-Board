import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import taskRouter from "./routes/task.js";

// Load environment variables from .env
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); // Parse incoming JSON request bodies

// --- Routes ---
app.use("/api/tasks", taskRouter); // Task CRUD

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// --- Global error handler ---
// Catches any error passed via next(err) and returns a clean JSON response
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
