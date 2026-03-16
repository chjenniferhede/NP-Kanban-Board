import type { Task } from "../../types";
import Tasks from "./tasks";

type Props = {
  title: string;
  tasks: Task[];
};

export default function Column({ title, tasks }: Props) {
  return (
    <div className="bg-base-200 rounded-xl p-3 w-72 flex-shrink-0 flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="badge badge-ghost badge-sm">{tasks.length}</span>
      </div>

      {/* Task list */}
      <Tasks tasks={tasks} />
    </div>
  );
}
