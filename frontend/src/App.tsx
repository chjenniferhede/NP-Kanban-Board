import Header from "./components/header";
import Sidebar from "./components/sidebar/sidebar";
import Overview from "./components/overview";
import Board from "./components/board/board";
import Team from "./components/board/team";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  useAuth();
  return (
    <div className="flex flex-col h-screen bg-[#fcf8f5]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-6 flex flex-col border-y border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <Overview />
            <Team />
          </div>
          <Board />
        </main>
      </div>
    </div>
  );
}
