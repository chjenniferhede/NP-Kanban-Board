import { useState } from "react";
import { useAtomValue } from "jotai";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../../types";
import { teamAtom } from "../../../hooks/useTeam";
import Tag from "./tag";
import CardDetails from "../card-details";

type Props = {
  task: Task;
};

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });
  const [open, setOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityConfig = {
    high:   { label: "High",   cls: "bg-red-100   text-red-700" },
    normal: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
    low:    { label: "Low",    cls: "bg-base-300   text-base-content/60" },
  };

  const p = task.priority ? priorityConfig[task.priority] : null;
  const team = useAtomValue(teamAtom);
  const assignees = team.filter((m) => task.assigneeIds?.includes(m.id));

  function formatDate(d: string) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setOpen(true)}
        className="bg-base-100 shadow-sm rounded-md p-3 flex flex-col gap-2 cursor-pointer touch-none w-full transition-all duration-150 hover:-translate-y-0.3 hover:shadow-md"
      >
        {/* Top badge row */}
        {p && (
          <div className="flex flex-wrap gap-1">
            <Tag label={p.label} className={p.cls} />
          </div>
        )}

        <p className="font-medium text-md leading-snug pl-0.5">{task.title}</p>

        {task.description && (
          <p className="text-xs text-base-content/60 line-clamp-2 pl-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 text-xs border border-base-300 px-1.5 py-0.5 text-base-content/60">
              <i className="fa-regular fa-calendar" style={{ fontSize: "10px" }} />
              {formatDate(task.dueDate)}
            </span>
          ) : <span />}
          <div className="flex -space-x-1">
            {assignees.length === 0 ? (
              <div className="tooltip tooltip-left" data-tip="Unassigned">
                <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
                  <i className="fa-regular fa-user text-base-content/40" style={{ fontSize: "10px" }} />
                </div>
              </div>
            ) : assignees.map((m) => (
              <div key={m.id} className="tooltip tooltip-left" data-tip={m.name}>
                <div className={`${m.color} w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold ring-1 ring-base-100`}>
                  {m.initials}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && <CardDetails task={task} onClose={() => setOpen(false)} />}
    </>
  );
}
