import { atom, useAtom, useAtomValue } from "jotai";
import type { Task } from "../types";
import { sessionAtom } from "./useAuth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const tasksAtom = atom<Task[]>([]);
export const searchAtom = atom("");
const loadingAtom = atom(false);
export const fetchErrorAtom = atom<string | null>(null);
export const fetchErrorCodeAtom = atom<number | null>(null);

export function useTasks() {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [fetchError, setFetchError] = useAtom(fetchErrorAtom);
  const [, setFetchErrorCode] = useAtom(fetchErrorCodeAtom);
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
    setFetchError(null);
    setFetchErrorCode(null);
    try {
      const res = await fetch(`${API}/api/tasks`, { headers: authHeaders() });
      if (!res.ok) {
        setFetchErrorCode(res.status);
        setFetchError(`Failed to load tasks`);
        return;
      }
      const data: Task[] = await res.json();
      setTasks(data);
    } catch {
      setFetchErrorCode(null);
      setFetchError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  async function createTask(
    fields: Pick<Task, "title"> & Partial<Pick<Task, "description" | "priority" | "dueDate" | "assigneeIds">>
  ) {
    const res = await fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ...fields, status: "todo" }),
    });
    if (!res.ok) throw new Error(`Failed to create task (${res.status})`);
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
    if (!res.ok) throw new Error(`Failed to update task (${res.status})`);
    const updated: Task = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async function deleteTask(id: string) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete task (${res.status})`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return { tasks, loading, fetchError, fetchTasks, createTask, updateTask, deleteTask };
}
