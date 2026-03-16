import { useState } from "react";
import type { Task } from "../types";

type Props = {
  onAdd: (task: Task) => void;
};

const MODAL_ID = "new-task-modal";

export function openNewTaskModal() {
  (document.getElementById(MODAL_ID) as HTMLDialogElement).showModal();
}

export default function NewTaskWindow({ onAdd }: Props) {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]       = useState<Task["priority"]>(undefined);
  const [dueDate, setDueDate]         = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setPriority(undefined);
    setDueDate("");
  }

  function handleAdd() {
    if (!title.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      status: "todo",
      userId: "guest",
      createdAt: new Date().toISOString().slice(0, 10),
      description: description.trim() || undefined,
      priority: priority || undefined,
      dueDate: dueDate || undefined,
    });
    reset();
    (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
  }

  function handleClose() {
    reset();
    (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
  }

  return (
    <dialog id={MODAL_ID} className="modal backdrop:backdrop-blur-sm">
      <div className="modal-box flex flex-col gap-4">
        <h3 className="font-bold text-lg">New task</h3>

        {/* Title */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Title <span className="text-error">*</span></legend>
          <input
            type="text"
            placeholder="Task title"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
        </fieldset>

        {/* Description */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Description</legend>
          <textarea
            placeholder="Optional"
            className="textarea textarea-bordered w-full resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </fieldset>

        {/* Priority + Due date side by side */}
        <div className="flex gap-3">
          <fieldset className="fieldset flex-1">
            <legend className="fieldset-legend">Priority</legend>
            <select
              className="select select-bordered w-full"
              value={priority ?? ""}
              onChange={(e) => setPriority((e.target.value as Task["priority"]) || undefined)}
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </fieldset>

          <fieldset className="fieldset flex-1">
            <legend className="fieldset-legend">Due date</legend>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </fieldset>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!title.trim()}>
            Add task
          </button>
        </div>
      </div>

      {/* Close on backdrop click */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={reset}>close</button>
      </form>
    </dialog>
  );
}
