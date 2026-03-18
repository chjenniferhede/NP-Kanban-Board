import { useState, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "../../types";
import Tasks from "./tasks";

type Props = {
  columnKey: string;
  title: string;
  tasks: Task[];
  accent: string;
  icon: string;
  totalCount: number;
};

export default function Column({ columnKey, title, tasks, accent, icon, totalCount }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  function setRefs(node: HTMLDivElement | null) {
    setNodeRef(node);
    scrollRef.current = node;
  }

  function handleScroll() {
    setScrolled((scrollRef.current?.scrollTop ?? 0) > 0);
  }

  return (
    <div className="bg-(--color-bg-column) rounded-md h-full flex flex-col overflow-hidden">
      <div className={`${accent} h-1 w-full rounded-t-md`} />

      {/* Header — always visible */}
      <div className="flex items-center gap-2 px-4 py-3">
        <i className={`fa-solid ${icon} text-xs text-base-content/40`} />
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="badge badge-ghost badge-sm">{tasks.length} of {totalCount}</span>
      </div>

      {/* Scrollable tasks area */}
      <div className="relative flex-1 min-h-0">
        {scrolled && (
          <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-black/10 to-transparent pointer-events-none z-10" />
        )}
        <div
          ref={setRefs}
          onScroll={handleScroll}
          className={`h-full overflow-y-auto px-3 pb-3 flex flex-col gap-2 transition-colors duration-150 ${isOver ? "bg-base-300" : ""}`}
        >
          <Tasks tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
