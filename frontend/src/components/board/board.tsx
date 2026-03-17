import { useEffect, useRef, useState } from "react";
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
import { tasksAtom, useTasks, fetchErrorCodeAtom, searchAtom } from "../../hooks/useTasks";
import { useComments } from "../../hooks/useComments";
import { sessionAtom } from "../../hooks/useAuth";
import { teamAtom } from "../../hooks/useTeam";
import Column from "./column/column";
import TaskCard from "./column/task";
import NewTaskWindow from "./new-task-window";
import Bar from "./bar";
import { useToast } from "../toast";
import { useSeedData } from "../../hooks/useSeedData";


const COLUMNS = [
  { key: "todo",        label: "To Do",       accent: "bg-(--color-status-todo)",        icon: "fa-circle-dot" },
  { key: "in_progress", label: "In Progress", accent: "bg-(--color-status-in-progress)", icon: "fa-circle-half-stroke" },
  { key: "in_review",   label: "In Review",   accent: "bg-(--color-status-in-review)",   icon: "fa-magnifying-glass" },
  { key: "done",        label: "Done",        accent: "bg-(--color-status-done)",        icon: "fa-circle-check" },
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
  const pointerYRef = useRef(0);
  useEffect(() => {
    const handler = (e: PointerEvent) => { pointerYRef.current = e.clientY; };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);
  const { fetchTasks, updateTask, loading, fetchError } = useTasks();
  useSeedData(loading, fetchTasks);
  const { fetchAllComments } = useComments();
  const fetchErrorCode = useAtomValue(fetchErrorCodeAtom);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");

  const search = useAtomValue(searchAtom);
  const team = useAtomValue(teamAtom);
  const session = useAtomValue(sessionAtom);
  const toast = useToast();
  useEffect(() => { if (session) { fetchTasks(); fetchAllComments(); } }, [session?.userId]);

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

      const draggedTask = prev[activeIndex];
      const overTask    = prev[overIndex];

      // Use arrayMove only when the card is still in its origin column.
      // Once it has been moved into a new column (status updated by a prior
      // onDragOver), another arrayMove call would incorrectly swap it past
      // the card it just landed beside. The splice path is pointer-accurate
      // and idempotent, so it handles both cross-column and within-new-column
      // reordering correctly.
      if (draggedTask.status === overTask.status && draggedTask.status === activeTask?.status) {
        return arrayMove(prev, activeIndex, overIndex);
      }

      const insertAfter = pointerYRef.current > over.rect.top + over.rect.height / 2;
      const without = prev.filter((t) => t.id !== activeId);
      const idx = without.findIndex((t) => t.id === overId);
      without.splice(insertAfter ? idx + 1 : idx, 0, { ...draggedTask, status: overTask.status });
      return without;
    });
  }

  async function onDragEnd({ active }: DragEndEvent) {
    if (activeTask) {
      const current = tasks.find((t) => t.id === active.id);
      if (current && current.status !== activeTask.status) {
        try {
          await updateTask(active.id as string, { status: current.status });
        } catch {
          toast("Failed to move task. Please try again.", "error");
          setTasks((prev) => prev.map((t) => t.id === active.id ? { ...t, status: activeTask.status } : t));
        }
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
          team={team}
          onPriorityChange={setFilterPriority}
          onAssigneeChange={setFilterAssignee}
          disabled
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
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <Bar
        priority={filterPriority}
        assignee={filterAssignee}
        team={team}
        onPriorityChange={setFilterPriority}
        onAssigneeChange={setFilterAssignee}
      />

      {/* Columns area grows to fill everything except the spacer */}
      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex gap-3 overflow-y-hidden max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory overflow-hidden">
            {COLUMNS.map(({ key, accent }) => (
              <div key={key} className="lg:flex-1 lg:min-w-0 h-full max-lg:flex-none max-lg:snap-start max-lg:snap-always max-sm:min-w-full sm:max-lg:min-w-[calc(50%-0.375rem)]">
                <div className="bg-(--color-bg-column) rounded-md h-full flex flex-col overflow-hidden">
                  <div className={`${accent} h-1 w-full rounded-t-xl`} />
                </div>
              </div>
            ))}
            <div className="shimmer-sweep absolute inset-0 pointer-events-none w-1/4 bg-linear-to-r from-transparent via-white/70 to-transparent" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="absolute inset-0 flex gap-3 overflow-y-hidden max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory">
              {COLUMNS.map(({ key, label, accent, icon }) => {
                const columnTasks = tasks.filter((t) => t.status === key);
                const q = search.trim().toLowerCase();
                const displayed = columnTasks.filter((t) => {
                  if (filterPriority && t.priority !== filterPriority) return false;
                  if (filterAssignee === "__unassigned__" && t.assigneeIds?.length) return false;
                  if (filterAssignee && filterAssignee !== "__unassigned__" && !t.assigneeIds?.includes(filterAssignee)) return false;
                  if (q && !`${t.title} ${t.description ?? ""}`.toLowerCase().includes(q)) return false;
                  return true;
                });
                return (
                  <div key={key} className="lg:flex-1 lg:min-w-0 h-full max-lg:flex-none max-lg:snap-start max-lg:snap-always max-sm:min-w-full sm:max-lg:min-w-[calc(50%-0.375rem)]">
                    <Column
                      columnKey={key}
                      title={label}
                      accent={accent}
                      icon={icon}
                      tasks={displayed}
                      totalCount={columnTasks.length}
                    />
                  </div>
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
      </div>

      {/* Bottom gap — real DOM element so overflow-hidden can't swallow it */}
      <div className="h-10 shrink-0" />

      <NewTaskWindow />
    </div>
  );
}
