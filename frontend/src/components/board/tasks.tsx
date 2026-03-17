import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "../../../types";
import TaskCard from "./task";

type Props = {
  columnKey: string;
  tasks: Task[];
};

export default function Tasks({ tasks }: Props) {
  return (
    <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-2 flex-1 min-h-8">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </SortableContext>
  );
}
