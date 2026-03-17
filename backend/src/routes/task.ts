import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { tasks } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { getTasksQuerySchema, createTaskSchema, updateTaskSchema } from "../validators/schema-validator.js";

const router: Router = Router();

// GET /api/tasks
router.get("/", validate(getTasksQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as { status?: "todo" | "in_progress" | "in_review" | "done" };
    const result = status
      ? await db.select().from(tasks).where(and(eq(tasks.userId, req.userId), eq(tasks.status, status)))
      : await db.select().from(tasks).where(eq(tasks.userId, req.userId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await db.select().from(tasks).where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)));
    if (!task.length) return res.status(404).json({ error: "Task not found" });
    res.json(task[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post("/", validate(createTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, status, description, priority, dueDate, assigneeIds } = req.body;
    const [task] = await db
      .insert(tasks)
      .values({ title, status, userId: req.userId, description, priority, dueDate, assigneeIds })
      .returning();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", validate(updateTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, status, description, priority, dueDate, assigneeIds } = req.body;
    const [task] = await db
      .update(tasks)
      .set({ title, status, description, priority, dueDate, assigneeIds })
      .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)))
      .returning();
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)))
      .returning();
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
