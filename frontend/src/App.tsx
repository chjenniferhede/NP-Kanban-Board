import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
  getFirstCollision,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

// Prefer pointer-within so empty columns are always reachable.
// Falls back to rectIntersection, then closestCenter for edge cases.
const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  const rect = rectIntersection(args);
  if (rect.length > 0) return rect;
  return getFirstCollision(closestCenter(args)) ? closestCenter(args) : [];
};
import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "./types";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Overview from "./components/overview";
import Column from "./components/column/column";
import TaskCard from "./components/column/task";

const COLUMNS = [
  { key: "todo",        label: "To Do",       accent: "bg-red-400" },
  { key: "in_progress", label: "In Progress", accent: "bg-amber-400" },
  { key: "in_review",   label: "In Review",   accent: "bg-blue-400" },
  { key: "done",        label: "Done",        accent: "bg-green-400" },
] as const;

const initialTasks: Task[] = [
  { id: "1", title: "Set up project",    status: "done",        userId: "u1", createdAt: "2026-03-01", priority: "high" },
  { id: "2", title: "Design schema",     status: "done",        userId: "u1", createdAt: "2026-03-02", priority: "normal" },
  { id: "3", title: "Build API routes",  status: "in_progress", userId: "u1", createdAt: "2026-03-10", priority: "high", description: "CRUD for tasks" },
  { id: "4", title: "Connect frontend",  status: "in_progress", userId: "u1", createdAt: "2026-03-11", priority: "normal" },
  { id: "5", title: "Write validators",  status: "in_review",   userId: "u1", createdAt: "2026-03-12", priority: "low" },
  { id: "6", title: "Build kanban UI",   status: "todo",        userId: "u1", createdAt: "2026-03-13", dueDate: "2026-03-20", priority: "high" },
  { id: "7", title: "Add auth",          status: "todo",        userId: "u1", createdAt: "2026-03-14", priority: "normal" },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 5px movement before drag starts — prevents accidental drags on click
      activationConstraint: { distance: 5 },
    })
  );

  function onDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId)!;
    // Check if we're hovering over a column (droppable) vs another task
    const overColumn = COLUMNS.find((c) => c.key === overId);

    if (overColumn && activeTask.status !== overColumn.key) {
      // Dropped directly onto a column — move task to that column
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overColumn.key } : t))
      );
    } else {
      // Hovering over another task — move into that task's column
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: overTask.status } : t))
        );
      }
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    // Reorder within the same column
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) return arrayMove(prev, oldIndex, newIndex);
      return prev;
    });
  }

  return (
    <div className="flex flex-col h-screen bg-base-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-6 flex flex-col">
          <Overview title="NP Kanban Board" />

          {/* Kanban board */}
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-4 flex-1">
              {COLUMNS.map(({ key, label, accent }) => (
                <Column
                  key={key}
                  columnKey={key}
                  title={label}
                  accent={accent}
                  tasks={tasks.filter((t) => t.status === key)}
                />
              ))}
            </div>

            {/* Floating drag preview */}
            <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
              {activeTask && (
                <div className="rotate-2 scale-105 opacity-95 shadow-xl">
                  <TaskCard task={activeTask} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </div>
  );
}
