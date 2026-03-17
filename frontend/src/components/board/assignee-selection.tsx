import { useAtomValue } from "jotai";
import { teamAtom } from "../../hooks/useTeam";
import { resolveAvatarColor } from "../../lib/avatarColors";

type Props = {
  assigneeIds: string[];
  onChange: (ids: string[]) => void;
};

export default function AssigneeSelection({ assigneeIds, onChange }: Props) {
  const team = useAtomValue(teamAtom);

  function toggle(memberId: string) {
    const next = assigneeIds.includes(memberId)
      ? assigneeIds.filter((id) => id !== memberId)
      : [...assigneeIds, memberId];
    onChange(next);
  }

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend flex items-center gap-1.5">
        <i className="fa-solid fa-user text-[10px]" />
        Assignee
      </legend>
      <div className="flex flex-wrap gap-2 pt-1 pb-7">
        <div className="tooltip tooltip-bottom" data-tip="Unassigned">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`w-9 h-9 rounded-full bg-(--color-avatar-unassigned) flex items-center justify-center transition-all ${!assigneeIds.length ? "ring-2 ring-primary ring-offset-1" : "opacity-50 hover:opacity-100"}`}
          >
            <i className="fa-regular fa-user text-base-content/50" style={{ fontSize: "13px" }} />
          </button>
        </div>
        {team.map((m) => {
          const selected = assigneeIds.includes(m.id);
          return (
            <div key={m.id} className="tooltip tooltip-bottom" data-tip={m.name}>
              <button
                type="button"
                onClick={() => toggle(m.id)}
                style={{ backgroundColor: resolveAvatarColor(m.color) }}
                className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${selected ? "ring-2 ring(--color-status-in-review) ring-offset-1" : "opacity-50 hover:opacity-100"}`}
              >
                {m.initials}
              </button>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
