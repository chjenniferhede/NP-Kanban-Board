// Mirrors the tasks table in backend/src/db/schema.ts
export type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  userId: string;
  createdAt: string;
  description?: string;
  priority?: "low" | "normal" | "high";
  dueDate?: string;
  assigneeId?: string;
};
