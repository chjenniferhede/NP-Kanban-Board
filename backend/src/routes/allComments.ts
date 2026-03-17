import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { comments, tasks } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

const router: Router = Router();

// GET /api/comments — all comments belonging to the current user's tasks
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
