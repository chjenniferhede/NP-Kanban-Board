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
  assigneeIds?: string[];
};

export type TeamMember = {
  id: string;
  userId: string;
  name: string;
  initials: string;
  color: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
};
