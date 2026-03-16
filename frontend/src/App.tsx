import type { Task } from "./types";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Overview from "./components/overview";
import Column from "./components/column/column";

// Placeholder tasks — replace with real API data later
const mockTasks: Task[] = [
  { id: "1", title: "Set up project", status: "done", userId: "u1", createdAt: "2026-03-01", priority: "high" },
  { id: "2", title: "Design schema", status: "done", userId: "u1", createdAt: "2026-03-02", priority: "normal" },
  { id: "3", title: "Build API routes", status: "in_progress", userId: "u1", createdAt: "2026-03-10", priority: "high", description: "CRUD for tasks" },
  { id: "4", title: "Connect frontend", status: "in_progress", userId: "u1", createdAt: "2026-03-11", priority: "normal" },
  { id: "5", title: "Write validators", status: "in_review", userId: "u1", createdAt: "2026-03-12", priority: "low" },
  { id: "6", title: "Build kanban UI", status: "todo", userId: "u1", createdAt: "2026-03-13", dueDate: "2026-03-20", priority: "high" },
  { id: "7", title: "Add auth", status: "todo", userId: "u1", createdAt: "2026-03-14", priority: "normal" },
];

const COLUMNS = [
  { key: "todo",        label: "To Do",       accent: "bg-red-400" },
  { key: "in_progress", label: "In Progress", accent: "bg-amber-400" },
  { key: "in_review",   label: "In Review",   accent: "bg-blue-400" },
  { key: "done",        label: "Done",         accent: "bg-green-400" },
];

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-base-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-6 flex flex-col">
          <Overview title="NP Kanban Board" />

          {/* Kanban board */}
          <div className="flex gap-4 flex-1">
            {COLUMNS.map(({ key, label, accent }) => (
              <Column
                key={key}
                title={label}
                accent={accent}
                tasks={mockTasks.filter((t) => t.status === key)}
              />
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}
