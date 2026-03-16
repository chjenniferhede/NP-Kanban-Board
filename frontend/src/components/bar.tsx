import { openNewTaskModal } from "./new-task-window";

type Props = {
  priority: string;
  assignee: string;
  label: string;
  onPriorityChange: (v: string) => void;
  onAssigneeChange: (v: string) => void;
  onLabelChange: (v: string) => void;
};

export default function Bar({ priority, assignee, label, onPriorityChange, onAssigneeChange, onLabelChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <select
          className="select select-bordered select-sm"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>

        <select
          className="select select-bordered select-sm"
          value={assignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
        >
          <option value="">All assignee</option>
        </select>

        <select
          className="select select-bordered select-sm"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
        >
          <option value="">All label</option>
        </select>
      </div>

      {/* New task button — w-72 matches column width */}
      <button className="btn btn-primary" onClick={openNewTaskModal}>
        + New task
      </button>
    </div>
  );
}
