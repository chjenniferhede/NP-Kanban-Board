import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { tasks } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router: Router = Router();

// GET /api/tasks — returns all tasks, optionally filtered by ?status=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const result = status
      ? await db.select().from(tasks).where(eq(tasks.status, status as "todo" | "in_progress" | "in_review" | "done"))
      : await db.select().from(tasks);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task.length) return res.status(404).json({ error: "Task not found" });
    res.json(task[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, status, userId, description, priority, dueDate, assigneeId } =
      req.body;
    const [task] = await db
      .insert(tasks)
      .values({
        title,
        status,
        userId,
        description,
        priority,
        dueDate,
        assigneeId,
      })
      .returning();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, status, description, priority, dueDate, assigneeId } =
      req.body;
    const [task] = await db
      .update(tasks)
      .set({ title, status, description, priority, dueDate, assigneeId })
      .where(eq(tasks.id, id))
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
      .where(eq(tasks.id, req.params.id))
      .returning();
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
