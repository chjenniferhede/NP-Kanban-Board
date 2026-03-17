import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { useTeam } from "../../hooks/useTeam";
import { sessionAtom } from "../../hooks/useAuth";
import { AVATAR_COLORS, resolveAvatarColor } from "../../lib/avatarColors";
import { useToast } from "../toast";

export default function Team() {
  const { team, fetchTeam, createMember } = useTeam();
  const session = useAtomValue(sessionAtom);
  const toast = useToast();
  const [name, setName]     = useState("");
  const [color, setColor]   = useState<string>(AVATAR_COLORS[0].value);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchTeam().then(async () => {
      if (localStorage.getItem("me-member-id")) return;
      localStorage.setItem("me-member-id", "pending");
      try {
        const raw = localStorage.getItem("me-profile");
        const meProfile = raw ? JSON.parse(raw) : { name: "Me", initials: "M", color: AVATAR_COLORS[3].value };
        const member = await createMember(meProfile);
        localStorage.setItem("me-member-id", member.id);
      } catch {
        localStorage.removeItem("me-member-id");
      }
    });
  }, [session?.userId]);

  function getInitials(fullName: string) {
    return fullName.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  async function addTeammate() {
    if (!name.trim()) {
      toast("Name cannot be empty.", "error");
      return;
    }
    setAdding(true);
    try {
      await createMember({ name: name.trim(), initials: getInitials(name), color });
      setName("");
      setColor(AVATAR_COLORS[0].value);
      (document.getElementById("add-teammate-modal") as HTMLDialogElement).close();
    } catch {
      toast("Failed to add teammate.", "error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="tooltip tooltip-left" data-tip="Unassigned">
            <div className="bg-(--color-avatar-unassigned) rounded-full w-8 h-8 flex items-center justify-center ring-2 ring-base-100">
              <i className="fa-regular fa-user text-base-content/40 text-[13px]" />
            </div>
          </div>
          {team.map((member) => (
            <div key={member.id} className="tooltip tooltip-left" data-tip={member.name}>
              <div style={{ backgroundColor: resolveAvatarColor(member.color) }} className="rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold ring-2 ring-base-100">
                {member.initials}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-outline btn-circle w-8 h-8 min-h-0"
          title="Add teammate"
          onClick={() => (document.getElementById("add-teammate-modal") as HTMLDialogElement).showModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
          </svg>
        </button>
      </div>

      <dialog id="add-teammate-modal" className="modal backdrop:bg-black/60">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="font-bold text-lg">Add teammate</h3>

          <label className="form-control w-full">
            <span className="label-text mb-1">Name</span>
            <input
              type="text"
              placeholder="Full name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTeammate()}
              autoFocus
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="label-text">Icon color</span>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c.value ? "ring-2 ring-offset-2 ring-base-content scale-110" : ""}`}
                />
              ))}
            </div>
          </div>

          {name.trim() && (
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: color }} className="rounded-full w-9 h-9 flex items-center justify-center text-xs font-semibold">
                {getInitials(name)}
              </div>
              <span className="text-sm">{name.trim()}</span>
            </div>
          )}

          <div className="modal-action mt-0">
            <button className="btn btn-ghost" onClick={() => (document.getElementById("add-teammate-modal") as HTMLDialogElement).close()}>
              Cancel
            </button>
            <button className="btn btn-action" onClick={addTeammate} disabled={!name.trim() || adding}>
              {adding ? <span className="loading loading-spinner loading-xs" /> : "Add"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </>
  );
}
