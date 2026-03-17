import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import type { Task } from "../../types";
import { useTasks } from "../../hooks/useTasks";
import { useToast } from "../toast";
import AssigneeSelection from "./assignee-selection";
import { sessionAtom } from "../../hooks/useAuth";
import { useComments } from "../../hooks/useComments";
import Tag from "./column/tag";
import Dropdown from "../dropdown";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Props = {
  task: Task;
  onClose: () => void;
};

const PRIORITY_CONFIG = {
  high:   { label: "High",   cls: "bg-(--color-priority-high-bg) text-(--color-priority-high-text)" },
  normal: { label: "Medium", cls: "bg-(--color-priority-mid-bg)  text-(--color-priority-mid-text)" },
  low:    { label: "Low",    cls: "bg-(--color-priority-low-bg)  text-(--color-priority-low-text)" },
} as const;


function EditableText({
  value,
  onSave,
  className = "",
  placeholder = "",
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      const el = ref.current;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft.trim() !== value) onSave(draft.trim());
  }

  if (!editing) {
    return (
      <div
        className={`cursor-text hover:bg-base-200 rounded px-1 -mx-1 transition-colors ${className}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value || <span className="text-base-content/30">{placeholder}</span>}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        value={draft}
        rows={4}
        className={`textarea textarea-bordered w-full resize-none ${className}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
      />
    );
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      value={draft}
      className={`input input-bordered w-full ${className}`}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
    />
  );
}

export default function CardDetails({ task, onClose }: Props) {
  const { updateTask } = useTasks();
  const { getComments, addComment } = useComments();
  const session = useAtomValue(sessionAtom);
  const toast = useToast();
  const comments = getComments(task.id);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  function authHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    };
  }

  async function patch(fields: Partial<Task>) {
    try {
      await updateTask(task.id, fields);
    } catch {
      toast("Failed to update task.", "error");
    }
  }

  async function submitComment() {
    if (!commentDraft.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API}/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ text: commentDraft.trim() }),
      });
      if (!res.ok) throw new Error();
      const comment = await res.json();
      addComment(comment);
      setCommentDraft("");
    } catch {
      toast("Failed to post comment.", "error");
    } finally {
      setSubmittingComment(false);
    }
  }

  const p = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  return createPortal(
    <div
      className="modal-overlay"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content bg-base-100 rounded-md shadow-2xl w-full max-w-5xl flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-base-200">
          <div className="flex items-center gap-2 text-sm text-base-content/40">
            <i className="fa-regular fa-clipboard" />
            <span>Task</span>
          </div>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div className="flex">

          {/* Left — main content */}
          <div className="flex-1 px-8 py-6 flex flex-col gap-7">

            {/* Title */}
            <EditableText
              value={task.title}
              onSave={(v) => patch({ title: v })}
              className="text-xl font-bold"
              placeholder="Task title"
            />

            {/* Priority tag */}
            {p && (
              <div className="flex gap-1 -mt-3">
                <Tag label={p.label} className={p.cls} />
              </div>
            )}

            {/* Description */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Description</legend>
              <EditableText
                value={task.description ?? ""}
                onSave={(v) => patch({ description: v })}
                className="text-sm text-base-content/70 min-h-[2rem]"
                placeholder="Add a description..."
                multiline
              />
            </fieldset>

            {/* Activity */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Activity</legend>

              <div className="flex flex-col gap-2 mb-4">
                {comments.length === 0 && (
                  <p className="text-sm text-base-content/30">No comments yet.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      <i className="fa-solid fa-user text-[10px]" />
                    </div>
                    <div>
                      <p className="text-sm">{c.text}</p>
                      <p className="text-xs text-base-content/30 mt-0.5">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="input input-bordered flex-1"
                  placeholder="Add a comment..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                />
                <button className="btn btn-action" onClick={submitComment} disabled={submittingComment}>
                  {submittingComment
                    ? <span className="loading loading-spinner loading-xs" />
                    : <i className="fa-solid fa-paper-plane" />}
                </button>
              </div>
            </fieldset>

          </div>

          {/* Right — details panel */}
          <div className="w-72 shrink-0 border-l border-base-200 px-6 py-3 flex flex-col gap-4">

            {/* Status */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-1.5">
                <i className="fa-solid fa-circle-half-stroke text-[10px]" />
                Status
              </legend>
              <Dropdown
                label="Status"
                value={task.status}
                onChange={(v) => patch({ status: v as Task["status"] })}
                buttonClassName="btn btn-filter btn-md w-full"
                menuClassName="w-full"
                options={[
                  { value: "todo",        label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "in_review",   label: "In Review" },
                  { value: "done",        label: "Done" },
                ]}
              />
            </fieldset>

            {/* Priority */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-1.5">
                <i className="fa-solid fa-flag text-[10px]" />
                Priority
              </legend>
              <Dropdown
                label="None"
                value={task.priority ?? ""}
                onChange={(v) => patch({ priority: (v as Task["priority"]) || undefined })}
                buttonClassName="btn btn-filter btn-md w-full"
                menuClassName="w-full"
                options={[
                  { value: "",       label: "None" },
                  { value: "low",    label: "Low" },
                  { value: "normal", label: "Medium" },
                  { value: "high",   label: "High" },
                ]}
              />
            </fieldset>

            {/* Due date */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-1.5">
                <i className="fa-solid fa-calendar text-[10px]" />
                Due date
              </legend>
              <input
                type="date"
                className="w-full h-8 px-2 rounded border border-base-300 bg-base-100 text-sm"
                value={task.dueDate ?? ""}
                onChange={(e) => patch({ dueDate: e.target.value || undefined })}
              />
            </fieldset>

            {/* Assignee */}
            <AssigneeSelection
              assigneeIds={task.assigneeIds ?? []}
              onChange={(ids) => patch({ assigneeIds: ids })}
            />

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
