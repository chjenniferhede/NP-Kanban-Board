import { useAtomValue } from "jotai";
import { tasksAtom } from "../hooks/useTasks";
import { teamAtom } from "../hooks/useTeam";
import type { Task } from "../types";

const STATUS_COLOR: Record<Task["status"], string> = {
  todo:        "#DA4D3F",
  in_progress: "#E8B402",
  in_review:   "#4D3F8D",
  done:        "#007F47",
};

const BLOCK_W = 10; // px per task block
const BLOCK_GAP = 2;

export default function Workload() {
  const tasks = useAtomValue(tasksAtom);
  const team  = useAtomValue(teamAtom);

  const rows = team
    .map((m) => ({ id: m.id, name: m.name, tasks: tasks.filter((t) => t.assigneeIds?.includes(m.id)) }))
    .filter((r) => r.tasks.length > 0);

  const unassigned = tasks.filter((t) => !t.assigneeIds?.length);
  if (unassigned.length > 0) {
    rows.push({ id: "unassigned", name: "Unassigned", tasks: unassigned });
  }

  if (rows.length === 0) {
    return <p className="text-xs text-base-content/30">No assignments yet</p>;
  }

  const maxTasks = Math.max(...rows.map((r) => r.tasks.length));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-base-content/60 truncate max-w-[120px]">
              {row.name}
            </span>
            <span className="text-[10px] text-base-content/40">{row.tasks.length}</span>
          </div>

          <div className="flex items-center gap-px relative h-5">
            {/* Track */}
            <div
              className="absolute inset-0 rounded-sm bg-base-300/50"
              style={{ width: `${maxTasks * (BLOCK_W + BLOCK_GAP)}px` }}
            />
            {/* Task blocks */}
            {row.tasks.map((task, i) => (
              <div
                key={task.id}
                className="h-full rounded-sm shrink-0 relative"
                style={{
                  width: BLOCK_W,
                  backgroundColor: STATUS_COLOR[task.status],
                  marginLeft: i === 0 ? 0 : BLOCK_GAP,
                }}
                title={task.title}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        {(Object.entries(STATUS_COLOR) as [Task["status"], string][]).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-base-content/40 capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
