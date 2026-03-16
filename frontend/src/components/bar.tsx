import { openNewTaskModal } from "./new-task-window";
import Dropdown from "./dropdown";

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
    <div className="flex items-center justify-between mb-4 py-2">
      <div className="flex items-center gap-2">
        <Dropdown
          label="All priority"
          value={priority}
          onChange={onPriorityChange}
          buttonClassName="btn btn-ghost btn-md border border-gray-300 min-w-36 font-normal"
          menuClassName="w-full"
          options={[
            { value: "", label: "All priority" },
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
          ]}
        />
        <Dropdown
          label="All assignee"
          value={assignee}
          onChange={onAssigneeChange}
          buttonClassName="btn btn-ghost border-gray-300 btn-md border border-base-300 min-w-36 font-normal"
          menuClassName="w-full"
          options={[{ value: "", label: "All assignee" }]}
        />
        <Dropdown
          label="All label"
          value={label}
          onChange={onLabelChange}
          buttonClassName="btn btn-ghost btn-md border border-gray-300 min-w-36 font-normal"
          menuClassName="w-full"
          options={[{ value: "", label: "All label" }]}
        />
      </div>

      <button className="btn btn-primary" onClick={openNewTaskModal}>
        + New task
      </button>
    </div>
  );
}
