import Stats from "./sidebar/stats";
import Workload from "./sidebar/workload";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-(--color-bg-sidebar) border-r border-y border-gray-300 min-h-full p-4 shrink-0 flex flex-col gap-6">
      <div >
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-3">Statistics</p>
        <Stats />
      </div>
      <hr className="border-gray-400" />
      <div >
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-3">Workload</p>
        <Workload />
      </div>
    </aside>
  );
}
