import { z } from "zod";

// --- Reusable field definitions ---

const uuidField = z.string().uuid();

const statusField = z.enum(["todo", "in_progress", "in_review", "done"]);

const priorityField = z.enum(["low", "normal", "high"]);

const dueDateField = z.string().date(); // expects "YYYY-MM-DD"

// --- Route schemas ---

// GET /api/tasks/:id — validate the id param
export const getTaskSchema = z.object({
  id: uuidField,
});

// POST /api/tasks — title, status, and userId are required; everything else optional
export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: statusField,
  userId: uuidField,
  description: z.string().optional(),
  priority: priorityField.optional(),
  dueDate: dueDateField.optional(),
  assigneeId: uuidField.optional(),
});

// PATCH /api/tasks/:id — all updatable fields are optional (partial update)
export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    status: statusField.optional(),
    description: z.string().optional(),
    priority: priorityField.optional(),
    dueDate: dueDateField.optional(),
    assigneeId: uuidField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// DELETE /api/tasks/:id — same param shape as GET
export const deleteTaskSchema = z.object({
  id: uuidField,
});
