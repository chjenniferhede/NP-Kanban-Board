import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: text("status", {
    enum: ["todo", "in_progress", "in_review", "done"],
  }).notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description"),
  priority: text("priority", { enum: ["low", "normal", "high"] }),
  dueDate: date("due_date"),
  assigneeId: uuid("assignee_id"),
});
