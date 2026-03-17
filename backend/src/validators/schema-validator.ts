import { z } from "zod";

// --- Reusable field definitions ---

const uuidField = z.string().uuid();

const statusField = z.enum(["todo", "in_progress", "in_review", "done"]);

const priorityField = z.enum(["low", "normal", "high"]);

const dueDateField = z.string().date(); // expects "YYYY-MM-DD"

// --- Task schemas ---

// GET /api/tasks?status= — optional status query filter
export const getTasksQuerySchema = z.object({
  status: statusField.optional(),
});

// GET /api/tasks/:id — validate the id param
export const getTaskSchema = z.object({
  id: uuidField,
});

// POST /api/tasks — title and status are required; everything else optional
export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: statusField,
  description: z.string().optional(),
  priority: priorityField.optional(),
  dueDate: dueDateField.optional(),
  assigneeIds: z.array(uuidField).optional(),
});

// PATCH /api/tasks/:id — all updatable fields are optional (partial update)
export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    status: statusField.optional(),
    description: z.string().optional(),
    priority: priorityField.optional(),
    dueDate: dueDateField.optional(),
    assigneeIds: z.array(uuidField).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// DELETE /api/tasks/:id — same param shape as GET
export const deleteTaskSchema = z.object({
  id: uuidField,
});

// --- Team schemas ---

// POST /api/team
export const createTeamMemberSchema = z.object({
  name: z.string().min(1),
  initials: z.string().min(1).max(2),
  color: z.string().min(1),
});

// PATCH /api/team/:id — all optional, at least one required
export const updateTeamMemberSchema = z
  .object({
    name: z.string().min(1).optional(),
    initials: z.string().min(1).max(2).optional(),
    color: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// --- Comment schemas ---

// POST /api/tasks/:taskId/comments
export const createCommentSchema = z.object({
  text: z.string().min(1),
});
