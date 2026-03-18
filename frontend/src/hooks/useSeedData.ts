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
        { title: "This is a sample task!", description: "Try drag me!", status: "todo", priority: "high", assigneeIds: [] },
        { title: "Click me to see details~", description: "Make direct edits in details", status: "in_progress", priority: "normal", assigneeIds: [jane.id] },
        { title: "You can also delete teammates", description: "Try hover over the avatars top right", status: "in_review", priority: "low", assigneeIds: [meMemberId, jane.id] },
      ];

      const createdTasks = [];
      for (const task of sampleTasks) {
        const res = await fetch(`${API}/api/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify(task),
        });
        if (res.ok) createdTasks.push(await res.json());
      }

      const commentSeeds: [number, string][] = [
        [0, "this is a comment"],
        [0, "this is cool!"],
        [1, "this is another comment"],
      ];
      for (const [idx, text] of commentSeeds) {
        if (!createdTasks[idx]) continue;
        await fetch(`${API}/api/tasks/${createdTasks[idx].id}/comments`, {
          method: "POST",
          headers,
          body: JSON.stringify({ text }),
        });
      }

      localStorage.setItem(`seeded-${session.userId}`, "1");
      fetchTasks();
    })();
  }, [session?.userId, loading, tasks.length, team.length]);
}
