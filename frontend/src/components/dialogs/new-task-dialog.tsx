import { useState, useRef } from "react";
import type { Task } from "../../types";
import { useTasks } from "../../hooks/useTasks";
import { useToast } from "../ui/toast";
import Dropdown from "../ui/dropdown";
import AssigneeSelection from "./assignee-selection";

const MODAL_ID = "new-task-modal";

export function openNewTaskModal() {
  (document.getElementById(MODAL_ID) as HTMLDialogElement).showModal();
}

export default function NewTaskWindow() {
  const { createTask } = useTasks();
  const toast = useToast();
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]       = useState<Task["priority"]>(undefined);
  const [dueDate, setDueDate]         = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [titleError, setTitleError]   = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority(undefined);
    setDueDate("");
    setAssigneeIds([]);
    if (dateInputRef.current) dateInputRef.current.value = "";
    setTitleError(false);
  }

  async function handleAdd() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
        assigneeIds: assigneeIds.length ? assigneeIds : undefined,
      });
      reset();
      (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
    } catch {
      toast("Failed to create task. Try again.", "error");
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
    <dialog id={MODAL_ID} className="modal backdrop:bg-black/60">
      <div className="modal-box w-full max-w-2xl flex flex-col gap-4 pb-16">
        <h3 className="font-bold text-lg">New task</h3>

        {/* Title */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Title <span className="text-error">*</span></legend>
          <input
            type="text"
            placeholder="Task title"
            className={`input input-bordered w-full ${titleError ? "input-invalid" : ""}`}
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(false); }}
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

        {/* Assignee */}
        <AssigneeSelection assigneeIds={assigneeIds} onChange={setAssigneeIds} />

        {/* Priority + Due date side by side */}
        <div className="flex gap-2">
          <fieldset className="fieldset flex-1">
            <legend className="fieldset-legend">Priority</legend>
            <Dropdown
              label="None"
              value={priority ?? ""}
              onChange={(v) => setPriority((v as Task["priority"]) || undefined)}
              buttonClassName="btn btn-filter btn-md w-full"
              menuClassName="w-full"
              options={[
                { value: "",       label: "None" },
                { value: "low",    label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high",   label: "High" },
              ]}
            />
          </fieldset>

          <fieldset className="fieldset flex-1">
            <legend className="fieldset-legend">Due date</legend>
            <input
              ref={dateInputRef}
              type="date"
              className="w-full h-10 px-3 rounded border border-base-300 bg-base-100 text-sm"
              defaultValue=""
              onChange={(e) => setDueDate(e.target.value)}
            />
          </fieldset>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
          <button className="btn btn-action" onClick={handleAdd} disabled={submitting}>
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
