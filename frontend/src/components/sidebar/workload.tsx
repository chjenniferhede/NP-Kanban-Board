import { useAtomValue } from "jotai";
import { tasksAtom } from "../../hooks/useTasks";
import { teamAtom } from "../../hooks/useTeam";
import type { Task } from "../../types";

const STATUS_COLOR: Record<Task["status"], string> = {
  todo:        "var(--color-status-todo)",
  in_progress: "var(--color-status-in-progress)",
  in_review:   "var(--color-status-in-review)",
  done:        "var(--color-status-done)",
};

const BLOCK_W = 10;
const BLOCK_GAP = 2;

export default function Workload() {
  const tasks = useAtomValue(tasksAtom);
  const team  = useAtomValue(teamAtom);
  const total = tasks.length;

  const rows = team.map((m) => ({
    id: m.id,
    name: m.name,
    tasks: tasks.filter((t) => t.assigneeIds?.includes(m.id)),
  }));

  const unassigned = tasks.filter((t) => !t.assigneeIds?.length);
  rows.push({ id: "unassigned", name: "Unassigned", tasks: unassigned });

  const maxTasks = Math.max(1, ...rows.map((r) => r.tasks.length));

  return (
    <div className="flex flex-col gap-3 p-3 rounded-md">
      {rows.map((row) => {
        const pct = total > 0 ? Math.round((row.tasks.length / total) * 100) : 0;
        return (
          <div key={row.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-base-content/60 truncate max-w-[120px]">
                {row.name}
              </span>
              <span className="text-[10px] text-base-content/40">{pct}%</span>
            </div>

            <div className="flex items-center gap-px relative h-5">
              <div
                className="absolute inset-0 rounded-sm"
                style={{ backgroundColor: "var(--color-bg-sidebar)", width: `${maxTasks * (BLOCK_W + BLOCK_GAP)}px` }}
              />
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
        );
      })}
    </div>
  );
}
