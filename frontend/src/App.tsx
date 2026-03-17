import Header from "./components/header";
import Sidebar from "./components/sidebar/sidebar";
import ProjectTitle from "./components/project-title";
import Board from "./components/board/board";
import Team from "./components/board/team";
import { Toaster } from "./components/toast";
import { useAuth } from "./hooks/useAuth";

const DRAWER_ID = "sidebar-drawer";

export default function App() {
  useAuth();
  return (
    <div className="flex flex-col h-screen bg-(--color-bg-app)">
      <Header />

      {/* drawer-open on lg+: sidebar always visible in layout; below lg: overlay */}
      <div className="drawer lg:drawer-open flex-1 overflow-hidden">
        <input id={DRAWER_ID} type="checkbox" className="drawer-toggle" />

        {/* ── Main content ── */}
        <div className="drawer-content flex flex-col overflow-hidden">
          <main className="flex-1 overflow-hidden min-h-0 p-4 md:p-6 flex flex-col border-y border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <ProjectTitle />
              <Team />
            </div>
            <Board />
          </main>
        </div>

        {/* ── Sidebar drawer ── */}
        <div className="drawer-side z-40">
          <label htmlFor={DRAWER_ID} aria-label="close sidebar" className="drawer-overlay" />
          <Sidebar />
        </div>
      </div>

      <Toaster />
    </div>
  );
}
