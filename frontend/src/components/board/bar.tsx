import { openNewTaskModal } from "./new-task-window";
import Dropdown from "../dropdown";
import type { TeamMember } from "../../types";
import { resolveAvatarColor } from "../../lib/avatarColors";

type Props = {
  priority: string;
  assignee: string;
  team: TeamMember[];
  onPriorityChange: (v: string) => void;
  onAssigneeChange: (v: string) => void;
};

export default function Bar({ priority, assignee, team, onPriorityChange, onAssigneeChange }: Props) {
  const assigneeOptions = [
    { value: "", label: "All assignee" },
    ...team.map((m) => ({ value: m.id, label: m.name, initials: m.initials, color: resolveAvatarColor(m.color) })),
  ];

  return (
    <div className="flex items-center justify-between mb-4 py-2">
      <div className="hidden md:flex items-center gap-2">
        <Dropdown
          label="All priority"
          value={priority}
          onChange={onPriorityChange}
          buttonClassName="btn btn-filter btn-md min-w-36"
          menuClassName="w-full"
          options={[
            { value: "", label: "All priority" },
            { value: "low", label: "Low" },
            { value: "normal", label: "Medium" },
            { value: "high", label: "High" },
          ]}
        />
        <Dropdown
          label="All assignee"
          value={assignee}
          onChange={onAssigneeChange}
          buttonClassName="btn btn-filter btn-md min-w-36"
          menuClassName="w-full"
          options={assigneeOptions}
        />
      </div>

      <button className="btn btn-action" onClick={openNewTaskModal}>
        + New task
      </button>
    </div>
  );
}
