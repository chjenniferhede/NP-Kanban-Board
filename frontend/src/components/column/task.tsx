import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types";
import Tag from "./tag";

type Props = {
  task: Task;
};

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityConfig = {
    high:   { label: "High",   cls: "bg-red-100   text-red-700" },
    normal: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
    low:    { label: "Low",    cls: "bg-base-200   text-base-content/50" },
  };

  const p = task.priority ? priorityConfig[task.priority] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card bg-base-100 shadow-sm rounded-md p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing touch-none"
    >
      {/* Top badge row */}
      {p && (
        <div className="flex flex-wrap gap-1">
          <Tag label={p.label} className={p.cls} />
        </div>
      )}

      <p className="font-medium text-md leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-base-content/60 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.dueDate && (
        <p className="text-xs text-base-content/40 mt-auto">{task.dueDate}</p>
      )}
    </div>
  );
}
