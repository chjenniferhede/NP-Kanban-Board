import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { sessionAtom } from "./useAuth";
import { tasksAtom } from "./useTasks";
import { teamAtom } from "./useTeam";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const SAMPLE_MEMBER = { name: "Teammate Jane", initials: "TJ", color: "#DCCCEC" };

export function useSeedData(loading: boolean, fetchTasks: () => Promise<void>) {
  const session = useAtomValue(sessionAtom);
  const tasks = useAtomValue(tasksAtom);
  const team = useAtomValue(teamAtom);
  const [, setTeam] = useAtom(teamAtom);
  const triggered = useRef(false);

  useEffect(() => {
    if (!session || loading || triggered.current || tasks.length > 0) return;
    if (team.length === 0) return; // wait for Team component to create "Me"
    const meMemberId = localStorage.getItem("me-member-id");
    if (!meMemberId || meMemberId === "pending") return;
    if (localStorage.getItem(`seeded-${session.userId}`)) return;

    triggered.current = true;

    (async () => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      };

      const memberRes = await fetch(`${API}/api/team`, {
        method: "POST",
        headers,
        body: JSON.stringify(SAMPLE_MEMBER),
      });
      if (!memberRes.ok) return;
      const jane = await memberRes.json();
      setTeam((prev) => [...prev, jane]);

      const sampleTasks = [
        { title: "This is a sample task", description: "Try drag me!", status: "todo", priority: "high", assigneeIds: [] },
        { title: "Click me to see details~", description: "Make direct edits in details", status: "in_progress", priority: "normal", assigneeIds: [jane.id] },
        { title: "This is a kanban board!", description: "Plan a sprint--", status: "in_review", priority: "low", assigneeIds: [meMemberId, jane.id] },
      ];

      for (const task of sampleTasks) {
        await fetch(`${API}/api/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify(task),
        });
      }

      localStorage.setItem(`seeded-${session.userId}`, "1");
      fetchTasks();
    })();
  }, [session?.userId, loading, tasks.length, team.length]);
}
