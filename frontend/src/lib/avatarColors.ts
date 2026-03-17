export const AVATAR_COLORS = [
  { label: "Pink",     value: "#FFCBE1" },
  { label: "Sage",     value: "#D6E5BD" },
  { label: "Butter",   value: "#F9E1A8" },
  { label: "Sky",      value: "#BCD8EC" },
  { label: "Lavender", value: "#DCCCEC" },
  { label: "Peach",    value: "#FFDAB4" },
] as const;

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[3].value; // Sky

// Maps legacy Tailwind class names to palette hex values
const TAILWIND_TO_HEX: Record<string, string> = {
  "bg-indigo-400": "#DCCCEC",
  "bg-purple-400": "#DCCCEC",
  "bg-blue-400":   "#BCD8EC",
  "bg-green-400":  "#D6E5BD",
  "bg-rose-400":   "#FFCBE1",
  "bg-amber-400":  "#F9E1A8",
  "bg-teal-400":   "#D6E5BD",
};

/** Accepts either a hex string or a legacy Tailwind class and returns a valid hex color. */
export function resolveAvatarColor(color: string): string {
  if (color.startsWith("#")) return color;
  return TAILWIND_TO_HEX[color] ?? DEFAULT_AVATAR_COLOR;
}
