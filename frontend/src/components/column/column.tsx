import type { Task } from "../../types";
import Tasks from "./tasks";

type Props = {
  title: string;
  tasks: Task[];
  accent: string;
};

export default function Column({ title, tasks, accent }: Props) {
  return (
    <div className="bg-base-200 rounded-xl w-72 shrink-0 flex flex-col overflow-hidden">
      {/* Colored accent bar */}
      <div className={`${accent} h-1 w-full rounded-t-xl`} />

      <div className="p-3 flex flex-col gap-3 flex-1">
        {/* Column header */}
        <div className="flex items-center gap-2 px-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="badge badge-ghost badge-sm">{tasks.length}</span>
        </div>

        {/* Task list — columnId used as the droppable id */}
        <Tasks columnId={title} tasks={tasks} />
      </div>
    </div>
  );
}
