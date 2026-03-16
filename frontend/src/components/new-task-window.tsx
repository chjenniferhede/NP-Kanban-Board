import { useState } from "react";
import { createPortal } from "react-dom";
import type { Task } from "../types";
import { useTasks } from "../hooks/useTasks";

const MODAL_ID = "new-task-modal";

export function openNewTaskModal() {
  (document.getElementById(MODAL_ID) as HTMLDialogElement).showModal();
}

export default function NewTaskWindow() {
  const { createTask } = useTasks();
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]       = useState<Task["priority"]>(undefined);
  const [dueDate, setDueDate]         = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [toast, setToast]             = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setPriority(undefined);
    setDueDate("");
  }

  async function handleAdd() {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
      });
      reset();
      (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
    } catch {
      setToast("Failed to create task. Try again.");
      setTimeout(() => setToast(""), 4000);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    reset();
    (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
  }

  return (
    <>
    {toast && createPortal(
      <div className="toast toast-top toast-center" style={{ zIndex: 9999 }}>
        <div className="alert alert-error">
          <span>{toast}</span>
        </div>
      </div>,
      document.body
    )}
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
          <button className="btn btn-primary" onClick={handleAdd} disabled={!title.trim() || submitting}>
            {submitting ? <span className="loading loading-spinner loading-xs" /> : "Add task"}
          </button>
        </div>
      </div>

      {/* Close on backdrop click */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={reset}>close</button>
      </form>
    </dialog>
    </>
  );
}
