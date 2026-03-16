import { atom, useAtom, useAtomValue } from "jotai";
import type { Task } from "../types";
import { sessionAtom } from "./useAuth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const tasksAtom = atom<Task[]>([]);
const loadingAtom = atom(false);

export function useTasks() {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const session = useAtomValue(sessionAtom);

  function authHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    };
  }

  async function fetchTasks() {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/tasks`, { headers: authHeaders() });
      const data: Task[] = await res.json();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(
    fields: Pick<Task, "title"> & Partial<Pick<Task, "description" | "priority" | "dueDate">>
  ) {
    const res = await fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ...fields, status: "todo" }),
    });
    const task: Task = await res.json();
    setTasks((prev) => [...prev, task]);
    return task;
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    const updated: Task = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  return { tasks, loading, fetchTasks, createTask, updateTask };
}
