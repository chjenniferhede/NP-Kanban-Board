import Stats from "./stats";
import Workload from "./workload";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#e0e0e0] border-l border-base-300 min-h-full p-4 shrink-0 flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-3">Stats</p>
        <Stats />
      </div>
      <div>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-3">Workload</p>
        <Workload />
      </div>
    </aside>
  );
}
