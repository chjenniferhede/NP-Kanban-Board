import { Router, Request, Response } from "express";
import { db } from "../db/client.js";
import { tasks } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router: Router = Router();

// GET /api/tasks — returns all tasks, optionally filtered by ?status=
router.get("/", async (req: Request, res: Response) => {
  const { status } = req.query;
  const result = status
    ? await db.select().from(tasks).where(eq(tasks.status, status as "todo" | "in_progress" | "in_review" | "done"))
    : await db.select().from(tasks);
  res.json(result);
});

// GET /api/tasks/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task.length) return res.status(404).json({ error: "Task not found" });
  res.json(task[0]);
});

// POST /api/tasks
router.post("/", async (req: Request, res: Response) => {
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
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req: Request, res: Response) => {
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
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const [task] = await db
    .delete(tasks)
    .where(eq(tasks.id, req.params.id))
    .returning();
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

export default router;
