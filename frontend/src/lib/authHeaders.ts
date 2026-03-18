type Session = { token: string } | null;

export function makeAuthHeaders(session: Session): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}
