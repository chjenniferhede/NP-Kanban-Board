import { useState } from "react";
import { useMe } from "../hooks/useMe";

const COLORS = [
  { label: "Indigo", value: "bg-indigo-400" },
  { label: "Purple", value: "bg-purple-400" },
  { label: "Blue",   value: "bg-blue-400" },
  { label: "Green",  value: "bg-green-400" },
  { label: "Rose",   value: "bg-rose-400" },
  { label: "Amber",  value: "bg-amber-400" },
  { label: "Teal",   value: "bg-teal-400" },
];

const MODAL_ID = "me-profile-modal";

export default function Header() {
  const { me, updateMe } = useMe();
  const [draftName, setDraftName]   = useState("");
  const [draftColor, setDraftColor] = useState("");

  function openModal() {
    setDraftName(me.name);
    setDraftColor(me.color);
    (document.getElementById(MODAL_ID) as HTMLDialogElement).showModal();
  }

  function getInitials(name: string) {
    return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "ME";
  }

  function save() {
    if (!draftName.trim()) return;
    updateMe({ name: draftName.trim(), initials: getInitials(draftName), color: draftColor });
    (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-6 min-h-20">
      {/* Left — spacer */}
      <div className="flex-1" />

      {/* Center — search bar */}
      <div className="flex-none w-96">
        <label className="input input-bordered flex items-center gap-2 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.71 20.29 18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z" />
          </svg>
          <input type="search" placeholder="Type something to search" className="grow" />
        </label>
      </div>

      {/* Right — Me avatar */}
      <div className="flex-1 flex justify-end">
        <div className="tooltip tooltip-left" data-tip={me.name}>
          <button
            onClick={openModal}
            className={`${me.color} w-9 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center ring-2 ring-base-100 hover:ring-primary transition-all`}
          >
            {me.initials}
          </button>
        </div>
      </div>

      {/* Edit Me modal */}
      <dialog id={MODAL_ID} className="modal backdrop:bg-black/60">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="font-bold text-lg">Your profile</h3>

          <label className="form-control w-full">
            <span className="label-text mb-1">Display name</span>
            <input
              type="text"
              placeholder="Your name"
              className="input input-bordered w-full"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="label-text">Avatar color</span>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setDraftColor(c.value)}
                  className={`${c.value} w-7 h-7 rounded-full transition-transform ${draftColor === c.value ? "ring-2 ring-offset-2 ring-base-content scale-110" : ""}`}
                />
              ))}
            </div>
          </div>

          {draftName.trim() && (
            <div className="flex items-center gap-3">
              <div className={`${draftColor} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-semibold`}>
                {getInitials(draftName)}
              </div>
              <span className="text-sm">{draftName.trim()}</span>
            </div>
          )}

          <div className="modal-action mt-0">
            <button className="btn btn-ghost" onClick={() => (document.getElementById(MODAL_ID) as HTMLDialogElement).close()}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={!draftName.trim()}>
              Save
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </header>
  );
}
