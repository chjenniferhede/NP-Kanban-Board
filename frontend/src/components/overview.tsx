import { useState, useRef, useEffect } from "react";

function loadTitle() {
  return localStorage.getItem("project-title") || "My Project";
}

export default function Overview() {
  const [title, setTitle]     = useState(loadTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(title);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function startEdit() {
    setDraft(title);
    setEditing(true);
  }

  function commit() {
    const next = draft.trim() || "My Project";
    setTitle(next);
    localStorage.setItem("project-title", next);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none mb-2 w-full max-w-xs"
      />
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-base-content/30 hover:text-base-content/60"
      >
        <i className="fa-solid fa-pen text-sm" />
      </button>
    </div>
  );
}
