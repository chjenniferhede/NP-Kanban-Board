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
import type { Task } from "../../types";
import { tasksAtom, useTasks, fetchErrorCodeAtom } from "../../hooks/useTasks";
import { sessionAtom } from "../../hooks/useAuth";
import { teamAtom } from "../../hooks/useTeam";
import Column from "./column/column";
import TaskCard from "./column/task";
import NewTaskWindow from "./new-task-window";
import Bar from "./bar";


const COLUMNS = [
  { key: "todo",        label: "To Do",       accent: "bg-[#DA4D3F]" },
  { key: "in_progress", label: "In Progress", accent: "bg-[#E8B402]" },
  { key: "in_review",   label: "In Review",   accent: "bg-[#4D3F8D]" },
  { key: "done",        label: "Done",        accent: "bg-[#007F47]" },
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
  const { fetchTasks, updateTask, loading, fetchError } = useTasks();
  const fetchErrorCode = useAtomValue(fetchErrorCodeAtom);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterLabel, setFilterLabel]       = useState("");

  const team = useAtomValue(teamAtom);
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
        // Only move here when the target column is empty; otherwise let
        // card-to-card collision handle positioning to avoid jumping to end.
        const columnHasTasks = prev.some((t) => t.id !== activeId && t.status === overId);
        if (columnHasTasks) return prev;
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

  if (fetchError) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <Bar
          priority={filterPriority}
          assignee={filterAssignee}
          label={filterLabel}
          team={team}
          onPriorityChange={setFilterPriority}
          onAssigneeChange={setFilterAssignee}
          onLabelChange={setFilterLabel}
        />
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
          <p className="text-5xl">⚠️</p>
          <h2 className="text-2xl font-bold">We can't load your board</h2>
          <p className="text-base-content/50 text-sm">
            The board failed to load. Please try again.
          </p>
          {fetchErrorCode && (
            <p className="text-xs text-base-content/30">Error code: {fetchErrorCode}</p>
          )}
          <button className="btn btn-action btn-sm mt-2" onClick={fetchTasks}>
            Go to board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Bar
        priority={filterPriority}
        assignee={filterAssignee}
        label={filterLabel}
        team={team}
        onPriorityChange={setFilterPriority}
        onAssigneeChange={setFilterAssignee}
        onLabelChange={setFilterLabel}
      />

      {loading ? (
        <div className="flex gap-4 flex-1 overflow-y-hidden pb-4 relative overflow-hidden">
          {COLUMNS.map(({ key, accent }) => (
            <div key={key} className="bg-base-200 rounded-md flex-1 flex flex-col overflow-hidden">
              <div className={`${accent} h-1 w-full rounded-t-xl`} />
            </div>
          ))}
          {/* single shimmer sweep across all columns */}
          <div
            className="absolute inset-0 pointer-events-none w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ animation: 'shimmer-sweep 2s ease-in-out infinite' }}
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 flex-1 overflow-y-hidden pb-4">
            {COLUMNS.map(({ key, label, accent }) => {
              const columnTasks = tasks.filter((t) => t.status === key);
              const displayed = columnTasks.filter((t) => {
                if (filterPriority && t.priority !== filterPriority) return false;
                if (filterAssignee && !t.assigneeIds?.includes(filterAssignee)) return false;
                return true;
              });
              return (
                <Column
                  key={key}
                  columnKey={key}
                  title={label}
                  accent={accent}
                  tasks={displayed}
                  totalCount={columnTasks.length}
                />
              );
            })}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeTask && (
              <div className="rotate-2 scale-105 opacity-95 shadow-xl">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <NewTaskWindow />
    </div>
  );
}
