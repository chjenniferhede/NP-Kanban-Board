import { atom, useAtom, useAtomValue } from "jotai";
import type { Comment } from "../types";
import { sessionAtom } from "./useAuth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// keyed by taskId
export const commentsAtom = atom<Record<string, Comment[]>>({});

export function useComments() {
  const [commentsMap, setCommentsMap] = useAtom(commentsAtom);
  const session = useAtomValue(sessionAtom);

  function authHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    };
  }

  async function fetchAllComments() {
    if (!session) return;
    try {
      const res = await fetch(`${API}/api/comments`, { headers: authHeaders() });
      if (!res.ok) return;
      const data: Comment[] = await res.json();
      const grouped: Record<string, Comment[]> = {};
      for (const c of data) {
        (grouped[c.taskId] ??= []).push(c);
      }
      setCommentsMap(grouped);
    } catch {
      // non-critical — card details will show empty
    }
  }

  function addComment(comment: Comment) {
    setCommentsMap((prev) => ({
      ...prev,
      [comment.taskId]: [...(prev[comment.taskId] ?? []), comment],
    }));
  }

  function getComments(taskId: string): Comment[] {
    return commentsMap[taskId] ?? [];
  }

  return { fetchAllComments, addComment, getComments };
}
