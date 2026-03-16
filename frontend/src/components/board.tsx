import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useAtom, useAtomValue } from "jotai";
import type { Task } from "../types";
import { tasksAtom, useTasks } from "../hooks/useTasks";
import { sessionAtom } from "../hooks/useAuth";
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

const collisionDetection: CollisionDetection = (args) => {
  const columnHit = pointerWithin(args).find((h) => COLUMNS.some((c) => c.key === h.id));
  if (!columnHit) return [];

  const columnRect = args.droppableContainers.find((c) => c.id === columnHit.id)?.rect.current;
  if (!columnRect) return [columnHit];

  const cardsInColumn = args.droppableContainers.filter((c) => {
    if (COLUMNS.some((col) => col.key === c.id)) return false;
    const rect = c.rect.current;
    if (!rect) return false;
    const cx = rect.left + rect.width / 2;
    return cx >= columnRect.left && cx <= columnRect.right;
  });

  if (cardsInColumn.length === 0) return [columnHit];

  const taskHit = closestCenter({ ...args, droppableContainers: cardsInColumn })[0];
  return taskHit ? [taskHit] : [columnHit];
};

export default function Board() {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const { fetchTasks, updateTask } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterLabel, setFilterLabel]       = useState("");

  const session = useAtomValue(sessionAtom);
  useEffect(() => { if (session) fetchTasks(); }, [session?.userId]);

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

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const isOverColumn = COLUMNS.some((c) => c.key === overId);

      if (isOverColumn) {
        const dragged = prev[activeIndex];
        if (dragged.status === overId) return prev;
        const without = prev.filter((t) => t.id !== activeId);
        return [...without, { ...dragged, status: overId as Task["status"] }];
      }

      const overIndex = prev.findIndex((t) => t.id === overId);
      if (overIndex === -1) return prev;

      const activeTask = prev[activeIndex];
      const overTask   = prev[overIndex];

      if (activeTask.status !== overTask.status) {
        // Cross-column: arrayMove gives wrong results because the active card's
        // flat-array index may be on either side of overIndex depending on column order.
        // Instead, remove and splice explicitly based on overlay center vs target center.
        const overlayRect = active.rect.current.translated;
        const insertAfter = overlayRect
          ? overlayRect.top + overlayRect.height / 2 > over.rect.top + over.rect.height / 2
          : false;
        const without = prev.filter((t) => t.id !== activeId);
        const idx = without.findIndex((t) => t.id === overId);
        without.splice(insertAfter ? idx + 1 : idx, 0, { ...activeTask, status: overTask.status });
        return without;
      }

      return arrayMove(prev, activeIndex, overIndex);
    });
  }

  function onDragEnd({ active }: DragEndEvent) {
    if (activeTask) {
      const current = tasks.find((t) => t.id === active.id);
      if (current && current.status !== activeTask.status) {
        updateTask(active.id as string, { status: current.status });
      }
    }
    setActiveTask(null);
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
        <div className="flex gap-4 flex-1 overflow-y-hidden pb-4">
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

      <NewTaskWindow />
    </div>
  );
}
