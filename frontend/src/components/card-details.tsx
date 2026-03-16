import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import type { Task, Comment } from "../types";
import { useTasks } from "../hooks/useTasks";
import { teamAtom } from "../hooks/useTeam";
import { sessionAtom } from "../hooks/useAuth";
import Tag from "./column/tag";
import Dropdown from "./dropdown";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Props = {
  task: Task;
  onClose: () => void;
};

const PRIORITY_CONFIG = {
  high:   { label: "High",   cls: "bg-red-100 text-red-700" },
  normal: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  low:    { label: "Low",    cls: "bg-base-200 text-base-content/50" },
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

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

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
  const team = useAtomValue(teamAtom);
  const session = useAtomValue(sessionAtom);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  function authHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    };
  }

  useEffect(() => {
    fetch(`${API}/api/tasks/${task.id}/comments`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Comment[]) => setComments(data));
  }, [task.id]);

  async function patch(fields: Partial<Task>) {
    await updateTask(task.id, fields);
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
      if (res.ok) {
        const comment: Comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setCommentDraft("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  function toggleAssignee(memberId: string) {
    const ids = task.assigneeIds ?? [];
    const next = ids.includes(memberId) ? ids.filter((id) => id !== memberId) : [...ids, memberId];
    patch({ assigneeIds: next });
  }

  const p = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-base-100 rounded-md shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ animation: "modal-in 0.2s ease-out" }}>

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
        <div className="flex flex-1 overflow-hidden">

          {/* Left — main content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">

            {/* Title */}
            <EditableText
              value={task.title}
              onSave={(v) => patch({ title: v })}
              className="text-xl font-bold"
              placeholder="Task title"
            />

            {/* Priority tag */}
            {p && (
              <div className="flex gap-1">
                <Tag label={p.label} className={p.cls} />
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-2">Description</p>
              <EditableText
                value={task.description ?? ""}
                onSave={(v) => patch({ description: v })}
                className="text-sm text-base-content/70 min-h-[2rem]"
                placeholder="Add a description..."
                multiline
              />
            </div>

            {/* Activity */}
            <div>
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-3">Activity</p>

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
                  className="input input-bordered input-sm flex-1 text-sm"
                  placeholder="Add a comment..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                />
                <button className="btn btn-primary btn-sm" onClick={submitComment} disabled={submittingComment}>
                  {submittingComment
                    ? <span className="loading loading-spinner loading-xs" />
                    : <i className="fa-solid fa-paper-plane" />}
                </button>
              </div>
            </div>

          </div>

          {/* Right — details panel */}
          <div className="w-64 shrink-0 border-l border-base-200 px-5 py-6 flex flex-col gap-4 overflow-y-auto">
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide">Details</p>

            {/* Status */}
            <DetailRow icon="fa-circle-half-stroke" label="Status">
              <Dropdown
                label="Status"
                value={task.status}
                onChange={(v) => patch({ status: v as Task["status"] })}
                buttonClassName="btn btn-ghost btn-xs border border-base-300 w-full font-normal text-xs"
                menuClassName="w-full"
                options={[
                  { value: "todo",        label: "To Do" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "in_review",   label: "In Review" },
                  { value: "done",        label: "Done" },
                ]}
              />
            </DetailRow>

            {/* Priority */}
            <DetailRow icon="fa-flag" label="Priority">
              <Dropdown
                label="None"
                value={task.priority ?? ""}
                onChange={(v) => patch({ priority: (v as Task["priority"]) || undefined })}
                buttonClassName="btn btn-ghost btn-xs border border-base-300 w-full font-normal text-xs"
                menuClassName="w-full"
                options={[
                  { value: "",       label: "None" },
                  { value: "low",    label: "Low" },
                  { value: "normal", label: "Medium" },
                  { value: "high",   label: "High" },
                ]}
              />
            </DetailRow>

            {/* Due date */}
            <DetailRow icon="fa-calendar" label="Due date">
              <input
                type="date"
                className="input input-bordered input-xs w-full"
                value={task.dueDate ?? ""}
                onChange={(e) => patch({ dueDate: e.target.value || undefined })}
              />
            </DetailRow>

            {/* Start date — display only, not in schema */}
            <DetailRow icon="fa-calendar-plus" label="Start date">
              <span className="text-xs text-base-content/30">None</span>
            </DetailRow>

            {/* Assignee */}
            <DetailRow icon="fa-user" label="Assignee">
              <div className="flex flex-wrap gap-1.5 pt-1">
                <div className="tooltip tooltip-bottom" data-tip="Unassigned">
                  <button
                    onClick={() => patch({ assigneeIds: [] })}
                    className={`w-7 h-7 rounded-full bg-base-200 flex items-center justify-center transition-all ${!task.assigneeIds?.length ? "ring-2 ring-primary ring-offset-1" : "opacity-50 hover:opacity-100"}`}
                  >
                    <i className="fa-regular fa-user text-base-content/50" style={{ fontSize: "11px" }} />
                  </button>
                </div>
                {team.map((m) => {
                  const selected = task.assigneeIds?.includes(m.id);
                  return (
                    <div key={m.id} className="tooltip tooltip-bottom" data-tip={m.name}>
                      <button
                        onClick={() => toggleAssignee(m.id)}
                        className={`${m.color} w-7 h-7 rounded-full text-white text-[9px] font-semibold flex items-center justify-center transition-all ${selected ? "ring-2 ring-primary ring-offset-1" : "opacity-50 hover:opacity-100"}`}
                      >
                        {m.initials}
                      </button>
                    </div>
                  );
                })}
              </div>
            </DetailRow>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

function DetailRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-base-content/40">
        <i className={`fa-solid ${icon} text-[10px]`} />
        {label}
      </div>
      {children}
    </div>
  );
}
