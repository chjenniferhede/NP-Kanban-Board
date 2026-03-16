import { useState } from "react";

type TeamMember = {
  id: string;
  name: string;
  initials: string;
  color: string; // Tailwind bg color class
};

const COLORS = [
  { label: "Purple", value: "bg-purple-400" },
  { label: "Blue",   value: "bg-blue-400" },
  { label: "Green",  value: "bg-green-400" },
  { label: "Rose",   value: "bg-rose-400" },
  { label: "Amber",  value: "bg-amber-400" },
  { label: "Teal",   value: "bg-teal-400" },
];

const initialTeam: TeamMember[] = [
  { id: "1", name: "Alex Rivera", initials: "AR", color: "bg-purple-400" },
  { id: "2", name: "Sam Chen",    initials: "SC", color: "bg-blue-400" },
  { id: "3", name: "Jordan Lee",  initials: "JL", color: "bg-teal-400" },
];

type Props = {
  title: string;
};

export default function Overview({ title }: Props) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0].value);

  function getInitials(fullName: string) {
    return fullName
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function addTeammate() {
    if (!name.trim()) return;
    setTeam([
      ...team,
      { id: crypto.randomUUID(), name: name.trim(), initials: getInitials(name), color },
    ]);
    setName("");
    setColor(COLORS[0].value);
    (document.getElementById("add-teammate-modal") as HTMLDialogElement).close();
  }

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Board title */}
      <h1 className="text-2xl font-bold">{title}</h1>

      {/* Team section */}
      <div className="flex items-center gap-3">
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {team.map((member) => (
            <div key={member.id} className="tooltip" data-tip={member.name}>
              <div className={`${member.color} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-semibold ring-2 ring-base-100`}>
                {member.initials}
              </div>
            </div>
          ))}
        </div>

        {/* Add teammate button */}
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
      <dialog id="add-teammate-modal" className="modal">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="font-bold text-lg">Add teammate</h3>

          {/* Name input */}
          <label className="form-control w-full">
            <span className="label-text mb-1">Name</span>
            <input
              type="text"
              placeholder="Full name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTeammate()}
            />
          </label>

          {/* Color picker */}
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

          {/* Preview */}
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
            <button className="btn btn-primary" onClick={addTeammate} disabled={!name.trim()}>
              Add
            </button>
          </div>
        </div>

        {/* Close on backdrop click */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
