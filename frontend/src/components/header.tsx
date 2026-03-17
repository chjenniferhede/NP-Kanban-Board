import { useState } from "react";
import { useAtom } from "jotai";
import logo from "../assets/vite.svg";
import { useMe } from "../hooks/useMe";
import { useTeam } from "../hooks/useTeam";
import { AVATAR_COLORS, resolveAvatarColor } from "../lib/avatarColors";
import { useToast } from "./ui/toast";
import { searchAtom } from "../hooks/useTasks";

const MODAL_ID = "me-profile-modal";

export default function Header() {
  const [search, setSearch] = useAtom(searchAtom);
  const { me, updateMe } = useMe();
  const { updateMember } = useTeam();
  const toast = useToast();
  const [draftName, setDraftName]   = useState("");
  const [draftColor, setDraftColor] = useState("");

  function openModal() {
    setDraftName(me.name);
    setDraftColor(me.color);
    (document.getElementById(MODAL_ID) as HTMLDialogElement).showModal();
  }

  function getInitials(name: string) {
    return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  }

  async function save() {
    if (!draftName.trim()) {
      toast("Name cannot be empty.", "error");
      return;
    }
    try {
      const fields = { name: draftName.trim(), initials: getInitials(draftName), color: draftColor };
      updateMe(fields);
      const meMemberId = localStorage.getItem("me-member-id");
      if (meMemberId && meMemberId !== "pending") await updateMember(meMemberId, fields);
      (document.getElementById(MODAL_ID) as HTMLDialogElement).close();
    } catch {
      toast("Failed to save profile.", "error");
    }
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-6 min-h-20">
      {/* Left — sidebar toggle (< lg only) */}
      <div className="flex-1 flex items-center gap-6">
        <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-sm btn-square lg:hidden" aria-label="Open sidebar">
          <i className="fa-solid fa-bars text-base" />
        </label>
        <img src={logo} alt="Logo" className="w-7 h-7" />
      </div>

      {/* Center — search bar */}
      <div className="hidden md:block flex-none w-96">
        <label className="input input-bordered bg-(--color-bg-search) flex items-center gap-2 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.71 20.29 18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z" />
          </svg>
          <input type="search" placeholder="Type something to search" className="grow" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      {/* Right — Me avatar */}
      <div className="flex-1 flex justify-end">
        <div className="tooltip tooltip-left" data-tip={me.name}>
          <button
            onClick={openModal}
            style={{ backgroundColor: resolveAvatarColor(me.color) }}
            className="w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center ring-2 ring-base-100 hover:ring-primary transition-all"
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
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setDraftColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-transform ${draftColor === c.value ? "ring-2 ring-offset-2 ring-base-content scale-110" : ""}`}
                />
              ))}
            </div>
          </div>

          {draftName.trim() && (
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: resolveAvatarColor(draftColor) }} className="rounded-full w-9 h-9 flex items-center justify-center text-xs font-semibold">
                {getInitials(draftName)}
              </div>
              <span className="text-sm">{draftName.trim()}</span>
            </div>
          )}

          <div className="modal-action mt-0">
            <button className="btn btn-ghost" onClick={() => (document.getElementById(MODAL_ID) as HTMLDialogElement).close()}>
              Cancel
            </button>
            <button className="btn btn-action" onClick={save} disabled={!draftName.trim()}>
              Save
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </header>
  );
}
