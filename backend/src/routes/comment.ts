import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { comments, tasks } from "../db/schema.js";
import { and, eq, inArray } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { createCommentSchema } from "../validators/schema-validator.js";

// GET /api/comments — all comments belonging to the current user's tasks
export const allCommentsRouter: Router = Router();
allCommentsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userTasks = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.userId, req.userId));

    if (userTasks.length === 0) return res.json([]);

    const taskIds = userTasks.map((t) => t.id);
    const result = await db
      .select()
      .from(comments)
      .where(inArray(comments.taskId, taskIds));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

const router: Router = Router({ mergeParams: true }); // mergeParams to access :taskId

// GET /api/tasks/:taskId/comments
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.taskId, req.params.taskId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:taskId/comments
router.post("/", validate(createCommentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const [comment] = await db
      .insert(comments)
      .values({ taskId: req.params.taskId, userId: req.userId, text })
      .returning();
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:taskId/comments/:id
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [comment] = await db
      .delete(comments)
      .where(and(eq(comments.id, req.params.id), eq(comments.userId, req.userId)))
      .returning();
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
