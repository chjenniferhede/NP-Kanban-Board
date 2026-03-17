import { useState } from "react";
import { useAtomValue } from "jotai";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types";
import { teamAtom } from "../../hooks/useTeam";
import { useComments } from "../../hooks/useComments";
import { useTasks, fetchErrorAtom } from "../../hooks/useTasks";
import { resolveAvatarColor } from "../../lib/avatarColors";
import { useToast } from "../ui/toast";
import Tag from "../ui/tag";
import CardDetails from "./task-details";
import DeleteConfirm from "../dialogs/delete-task-dialog";

type Props = {
  task: Task;
};

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityConfig = {
    high:   { label: "High",   cls: "bg-(--color-priority-high-bg) text-(--color-priority-high-text)" },
    normal: { label: "Medium", cls: "bg-(--color-priority-mid-bg)  text-(--color-priority-mid-text)" },
    low:    { label: "Low",    cls: "bg-(--color-priority-low-bg)  text-(--color-priority-low-text)" },
  };

  const p = task.priority ? priorityConfig[task.priority] : null;
  const { getComments } = useComments();
  const commentCount = getComments(task.id).length;
  const { deleteTask } = useTasks();
  const fetchError = useAtomValue(fetchErrorAtom);
  const toast = useToast();
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
        className="bg-(--color-bg-app) shadow-sm rounded-md p-3 flex flex-col gap-2 cursor-pointer touch-none w-full transition-all duration-150 hover:-translate-y-0.3 hover:shadow-md"
      >
        {/* Top badge row */}
        <div className="flex items-center justify-between gap-1">
          {p ? <Tag label={p.label} className={p.cls} /> : <span />}
          <div className="flex items-center gap-2 ml-auto">
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-base-content/50 w-6 h-6 justify-center">
                <i className="fa-regular fa-comment text-[9px]" />
                {commentCount}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="w-6 h-6 flex items-center justify-center text-base-content/30 hover:text-error hover:bg-error/10 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
              disabled={!!fetchError}
            >
              <i className="fa-regular fa-trash-can text-[10px]" />
            </button>
          </div>
        </div>

        <p className="font-semibold text-md leading-snug pl-0.5">{task.title}</p>

        {task.description && (
          <p className="text-xs text-base-content/60 line-clamp-2 pl-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 text-xs border border-base-300 px-1.5 py-0.5 text-base-content/60">
              <i className="fa-regular fa-calendar text-[10px]" />
              {formatDate(task.dueDate)}
            </span>
          ) : <span />}
          <div className="flex -space-x-1">
            {assignees.length === 0 ? (
              <div className="tooltip tooltip-left" data-tip="Unassigned">
                <div className="w-6 h-6 rounded-full bg-(--color-avatar-unassigned) flex items-center justify-center">
                  <i className="fa-regular fa-user text-base-content/40" style={{ fontSize: "10px" }} />
                </div>
              </div>
            ) : assignees.map((m) => (
              <div key={m.id} className="tooltip tooltip-left" data-tip={m.name}>
                <div style={{ backgroundColor: resolveAvatarColor(m.color) }} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold ring-1 ring-base-100">
                  {m.initials}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && <CardDetails task={task} onClose={() => setOpen(false)} />}
      {confirmDelete && (
        <DeleteConfirm
          onConfirm={() => {
            setConfirmDelete(false);
            deleteTask(task.id).catch(() => toast("Failed to delete task. Please try again.", "error"));
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

