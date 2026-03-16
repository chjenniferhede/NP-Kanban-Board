import { openNewTaskModal } from "./new-task-window";

type Props = {
  priority: string;
  assignee: string;
  label: string;
  onPriorityChange: (v: string) => void;
  onAssigneeChange: (v: string) => void;
  onLabelChange: (v: string) => void;
};

type DropdownProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
};

function FilterDropdown({ label, options, value, onChange }: DropdownProps) {
  const selected = options.find((o) => o.value === value)?.label ?? label;
  return (
    <details className="dropdown">
      <summary className="btn btn-ghost btn-md border border-base-300 min-w-36 justify-between gap-2 font-normal">
        {selected}
        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <ul className="dropdown-content menu bg-base-100 rounded-box shadow-lg border border-base-200 z-10 w-full p-1">
        {options.map((o) => (
          <li key={o.value}>
            <a
              className={value === o.value ? "active" : ""}
              onClick={() => {
                onChange(o.value);
                (document.activeElement as HTMLElement)?.closest("details")?.removeAttribute("open");
              }}
            >
              {o.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function Bar({ priority, assignee, label, onPriorityChange, onAssigneeChange, onLabelChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 py-2">
      <div className="flex items-center gap-2">
        <FilterDropdown
          label="All priority"
          value={priority}
          onChange={onPriorityChange}
          options={[
            { value: "", label: "All priority" },
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
          ]}
        />
        <FilterDropdown
          label="All assignee"
          value={assignee}
          onChange={onAssigneeChange}
          options={[{ value: "", label: "All assignee" }]}
        />
        <FilterDropdown
          label="All label"
          value={label}
          onChange={onLabelChange}
          options={[{ value: "", label: "All label" }]}
        />
      </div>

      <button className="btn btn-primary" onClick={openNewTaskModal}>
        + New task
      </button>
    </div>
  );
}
