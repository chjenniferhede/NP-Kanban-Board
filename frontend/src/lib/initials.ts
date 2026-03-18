export function getInitials(name: string): string {
  return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}
