import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Overview from "./components/overview";
import Board from "./components/board";

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-base-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-6 flex flex-col">
          <Overview title="NP Kanban Board" />
          <Board />
        </main>
      </div>
    </div>
  );
}
