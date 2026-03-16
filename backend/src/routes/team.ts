import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { teamMembers } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

const router: Router = Router();

// GET /api/team
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await db.select().from(teamMembers).where(eq(teamMembers.userId, req.userId));
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// POST /api/team
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, initials, color } = req.body;
    const [member] = await db
      .insert(teamMembers)
      .values({ userId: req.userId, name, initials, color })
      .returning();
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/team/:id
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [member] = await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.id, req.params.id), eq(teamMembers.userId, req.userId)))
      .returning();
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
