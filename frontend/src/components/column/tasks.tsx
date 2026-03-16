import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "../../types";
import TaskCard from "./task";

type Props = {
  columnId: string;
  tasks: Task[];
};

export default function Tasks({ columnId, tasks }: Props) {
  // Make the entire column droppable so cards can be dropped into empty columns too
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="flex flex-col gap-2 flex-1 min-h-12">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </SortableContext>
  );
}
