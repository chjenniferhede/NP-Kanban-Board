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
import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "../types";
import Column from "./column/column";
import TaskCard from "./column/task";
import NewTaskWindow from "./new-task-window";
import Bar from "./bar";

const COLUMNS = [
  { key: "todo",        label: "To Do",       accent: "bg-red-400" },
  { key: "in_progress", label: "In Progress", accent: "bg-amber-400" },
  { key: "in_review",   label: "In Review",   accent: "bg-blue-400" },
  { key: "done",        label: "Done",        accent: "bg-green-400" },
] as const;

const initialTasks: Task[] = [
  { id: "1", title: "Set up project",   status: "done",        userId: "u1", createdAt: "2026-03-01", priority: "high" },
  { id: "2", title: "Design schema",    status: "done",        userId: "u1", createdAt: "2026-03-02", priority: "normal" },
  { id: "3", title: "Build API routes", status: "in_progress", userId: "u1", createdAt: "2026-03-10", priority: "high", description: "CRUD for tasks" },
  { id: "4", title: "Connect frontend", status: "in_progress", userId: "u1", createdAt: "2026-03-11", priority: "normal" },
  { id: "5", title: "Write validators", status: "in_review",   userId: "u1", createdAt: "2026-03-12", priority: "low" },
  { id: "6", title: "Build kanban UI",  status: "todo",        userId: "u1", createdAt: "2026-03-13", dueDate: "2026-03-20", priority: "high" },
  { id: "7", title: "Add auth",         status: "todo",        userId: "u1", createdAt: "2026-03-14", priority: "normal" },
];

// Prefer pointer-within so empty columns are always reachable.
// Falls back to rectIntersection, then closestCenter for edge cases.
const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  const rect = rectIntersection(args);
  if (rect.length > 0) return rect;
  return getFirstCollision(closestCenter(args)) ? closestCenter(args) : [];
};

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Filter state — no-op visually for now, ready for wiring
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterLabel, setFilterLabel]       = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId   = over.id as string;
    if (activeId === overId) return;

    const dragged = tasks.find((t) => t.id === activeId)!;
    const overColumn = COLUMNS.find((c) => c.key === overId);

    if (overColumn && dragged.status !== overColumn.key) {
      setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, status: overColumn.key } : t)));
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && dragged.status !== overTask.status) {
        setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, status: overTask.status } : t)));
      }
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId   = over.id as string;
    if (activeId === overId) return;
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) return arrayMove(prev, oldIndex, newIndex);
      return prev;
    });
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Bar
        priority={filterPriority}
        assignee={filterAssignee}
        label={filterLabel}
        onPriorityChange={setFilterPriority}
        onAssigneeChange={setFilterAssignee}
        onLabelChange={setFilterLabel}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
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

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeTask && (
            <div className="rotate-2 scale-105 opacity-95 shadow-xl">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <NewTaskWindow onAdd={(task) => setTasks((prev) => [...prev, task])} />
    </div>
  );
}
