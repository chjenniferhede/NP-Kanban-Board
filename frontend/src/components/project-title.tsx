import { useState, useRef, useEffect } from "react";
import { useToast } from "./toast";

function loadTitle() {
  return localStorage.getItem("project-title") || "My Project";
}

export default function ProjectTitle() {
  const [title, setTitle]     = useState(loadTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(title);
  const inputRef              = useRef<HTMLInputElement>(null);
  const toast                 = useToast();

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function startEdit() {
    setDraft(title);
    setEditing(true);
  }

  function commit() {
    if (!draft.trim()) {
      toast("Project title cannot be empty.", "error");
      return;
    }
    try {
      const next = draft.trim();
      localStorage.setItem("project-title", next);
      setTitle(next);
      setEditing(false);
    } catch {
      toast("Failed to save project title.", "error");
    }
  }

  function cancel() {
    setDraft(title);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {/* Invisible sizer keeps layout stable */}
        <h1 className="text-2xl font-bold invisible whitespace-pre">{draft || "My Project"}</h1>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            className="absolute inset-0 text-2xl font-bold bg-transparent border-none outline-none w-full"
          />
        ) : (
          <h1 className="absolute inset-0 text-2xl font-bold">{title}</h1>
        )}
      </div>
      <button
        onClick={startEdit}
        className="text-base-content/30 hover:text-base-content/70 hover:bg-(--color-bg-column) transition-all p-1.5 rounded"
      >
        <i className="fa-solid fa-pen text-sm" />
      </button>
    </div>
  );
}
