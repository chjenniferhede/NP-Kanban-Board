import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card bg-base-100 shadow-sm p-3 gap-1 cursor-grab active:cursor-grabbing touch-none"
    >
      <p className="font-medium text-sm">{task.title}</p>

      {task.description && (
        <p className="text-xs text-base-content/60 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        {task.priority && (
          <span
            className={`badge badge-sm ${
              task.priority === "high"
                ? "badge-error"
                : task.priority === "normal"
                ? "badge-warning"
                : "badge-ghost"
            }`}
          >
            {task.priority}
          </span>
        )}
        {task.dueDate && (
          <span className="text-xs text-base-content/50">{task.dueDate}</span>
        )}
      </div>
    </div>
  );
}
