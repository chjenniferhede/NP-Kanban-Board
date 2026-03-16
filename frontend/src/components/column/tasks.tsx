import type { Task } from "../../types";
import TaskCard from "./task";

type Props = {
  tasks: Task[];
};

export default function Tasks({ tasks }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
