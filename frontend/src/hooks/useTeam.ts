import { atom, useAtom, useAtomValue } from "jotai";
import type { TeamMember } from "../types";
import { sessionAtom } from "./useAuth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const teamAtom = atom<TeamMember[]>([]);

export function useTeam() {
  const [team, setTeam] = useAtom(teamAtom);
  const session = useAtomValue(sessionAtom);

  function authHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    };
  }

  async function fetchTeam() {
    if (!session) return;
    const res = await fetch(`${API}/api/team`, { headers: authHeaders() });
    if (!res.ok) return;
    const data: TeamMember[] = await res.json();

    const storedMeId = localStorage.getItem("me-member-id");
    if (!storedMeId || !data.find((m) => m.id === storedMeId)) {
      const raw = localStorage.getItem("me-profile");
      const meProfile = raw
        ? JSON.parse(raw)
        : { name: "Me", initials: "ME", color: "bg-indigo-400" };
      const seedRes = await fetch(`${API}/api/team`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(meProfile),
      });
      if (seedRes.ok) {
        const member: TeamMember = await seedRes.json();
        localStorage.setItem("me-member-id", member.id);
        setTeam([...data, member]);
        return;
      }
    }

    setTeam(data);
  }

  async function createMember(fields: Pick<TeamMember, "name" | "initials" | "color">) {
    const res = await fetch(`${API}/api/team`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error("Failed to create team member");
    const member: TeamMember = await res.json();
    setTeam((prev) => [...prev, member]);
    return member;
  }

  async function deleteMember(id: string) {
    const res = await fetch(`${API}/api/team/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete team member");
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  return { team, fetchTeam, createMember, deleteMember };
}
