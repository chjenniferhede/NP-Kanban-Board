import { useDroppable } from "@dnd-kit/core";
import type { Task } from "../../types";
import Tasks from "./tasks";

type Props = {
  columnKey: string;
  title: string;
  tasks: Task[];
  accent: string;
};

export default function Column({ columnKey, title, tasks, accent }: Props) {
  // The whole column body is the droppable — works even when empty
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });

  return (
    <div className="bg-base-200 rounded-md flex-1 flex flex-col overflow-hidden">
      <div className={`${accent} h-1 w-full rounded-t-md`} />

      <div
        ref={setNodeRef}
        className={`p-3 flex flex-col gap-3 flex-1 transition-colors duration-150 ${isOver ? "bg-base-300" : ""}`}
      >
        <div className="flex items-center gap-2 px-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="badge badge-ghost badge-sm">{tasks.length}</span>
        </div>

        <Tasks columnKey={columnKey} tasks={tasks} />
      </div>
    </div>
  );
}
