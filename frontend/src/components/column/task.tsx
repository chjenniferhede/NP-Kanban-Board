import type { Task } from "../../types";

type Props = {
  task: Task;
};

export default function TaskCard({ task }: Props) {
  return (
    <div className="card bg-base-100 shadow-sm p-3 gap-1">
      <p className="font-medium text-sm">{task.title}</p>

      {task.description && (
        <p className="text-xs text-base-content/60 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        {/* Priority badge */}
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

        {/* Due date */}
        {task.dueDate && (
          <span className="text-xs text-base-content/50">{task.dueDate}</span>
        )}
      </div>
    </div>
  );
}
