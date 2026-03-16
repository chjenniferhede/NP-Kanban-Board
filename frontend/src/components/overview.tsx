import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { useTeam } from "../hooks/useTeam";
import { sessionAtom } from "../hooks/useAuth";

const COLORS = [
  { label: "Purple", value: "bg-purple-400" },
  { label: "Blue",   value: "bg-blue-400" },
  { label: "Green",  value: "bg-green-400" },
  { label: "Rose",   value: "bg-rose-400" },
  { label: "Amber",  value: "bg-amber-400" },
  { label: "Teal",   value: "bg-teal-400" },
];

type Props = { title: string };

export default function Overview({ title }: Props) {
  const { team, fetchTeam, createMember } = useTeam();
  const session = useAtomValue(sessionAtom);
  const [name, setName]   = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchTeam().then(async () => {
      if (localStorage.getItem("me-member-id")) return;
      localStorage.setItem("me-member-id", "pending");
      try {
        const raw = localStorage.getItem("me-profile");
        const meProfile = raw ? JSON.parse(raw) : { name: "Me", initials: "ME", color: "bg-indigo-400" };
        const member = await createMember(meProfile);
        if (member) localStorage.setItem("me-member-id", member.id);
      } catch {
        localStorage.removeItem("me-member-id");
      }
    });
  }, [session?.userId]);

  function getInitials(fullName: string) {
    return fullName.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  async function addTeammate() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createMember({ name: name.trim(), initials: getInitials(name), color });
      setName("");
      setColor(COLORS[0].value);
      (document.getElementById("add-teammate-modal") as HTMLDialogElement).close();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {/* Unassigned — always present */}
          <div className="tooltip tooltip-left" data-tip="Unassigned">
            <div className="bg-base-200 rounded-full w-9 h-9 flex items-center justify-center ring-2 ring-base-100">
              <i className="fa-regular fa-user text-base-content/40" style={{ fontSize: "14px" }} />
            </div>
          </div>
          {team.map((member) => (
            <div key={member.id} className="tooltip tooltip-left" data-tip={member.name}>
              <div className={`${member.color} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-semibold ring-2 ring-base-100`}>
                {member.initials}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-sm btn-outline btn-circle"
          title="Add teammate"
          onClick={() => (document.getElementById("add-teammate-modal") as HTMLDialogElement).showModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
          </svg>
        </button>
      </div>

      {/* Add teammate modal */}
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
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`${c.value} w-7 h-7 rounded-full transition-transform ${color === c.value ? "ring-2 ring-offset-2 ring-base-content scale-110" : ""}`}
                />
              ))}
            </div>
          </div>

          {name.trim() && (
            <div className="flex items-center gap-3">
              <div className={`${color} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-semibold`}>
                {getInitials(name)}
              </div>
              <span className="text-sm">{name.trim()}</span>
            </div>
          )}

          <div className="modal-action mt-0">
            <button className="btn btn-ghost" onClick={() => (document.getElementById("add-teammate-modal") as HTMLDialogElement).close()}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={addTeammate} disabled={!name.trim() || adding}>
              {adding ? <span className="loading loading-spinner loading-xs" /> : "Add"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
