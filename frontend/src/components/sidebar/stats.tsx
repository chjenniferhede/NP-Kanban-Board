import { useAtomValue } from "jotai";
import { tasksAtom } from "../../hooks/useTasks";

const COLUMNS = [
  { key: "todo",        label: "To Do",       color: "#DA4D3F" },
  { key: "in_progress", label: "In Progress", color: "#E8B402" },
  { key: "in_review",   label: "In Review",   color: "#4D3F8D" },
  { key: "done",        label: "Done",        color: "#007F47" },
] as const;

const R = 32;
const CX = 50;
const CY = 50;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function Stats() {
  const tasks = useAtomValue(tasksAtom);
  const total = tasks.length;

  const counts = COLUMNS.map((col) => ({
    ...col,
    count: tasks.filter((t) => t.status === col.key).length,
  }));

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 100 100" width="130" height="130">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth="16" />
        </svg>
        <p className="text-xs text-base-content/30">No tasks yet</p>
      </div>
    );
  }

  let offset = 0;
  const segments = counts.map((col) => {
    const length = (col.count / total) * CIRCUMFERENCE;
    const seg = { ...col, length, offset };
    offset += length;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 100 100" width="130" height="130">
        {/* Background ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth="16" />
        {segments.map((seg) =>
          seg.count > 0 ? (
            <circle
              key={seg.key}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${seg.length} ${CIRCUMFERENCE}`}
              strokeDashoffset={-seg.offset}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          ) : null
        )}
      </svg>

      <div className="flex flex-col gap-1.5 w-full">
        {counts.map((col) => (
          <div key={col.key} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="text-base-content/70">{col.label}</span>
            </div>
            <span className="text-base-content/50">
              {total > 0 ? Math.round((col.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
