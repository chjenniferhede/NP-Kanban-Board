import { atom, useAtom } from "jotai";
import { DEFAULT_AVATAR_COLOR } from "../lib/avatarColors";

export type MeProfile = {
  name: string;
  initials: string;
  color: string;
};

const DEFAULT: MeProfile = { name: "Me", initials: "ME", color: DEFAULT_AVATAR_COLOR };

function load(): MeProfile {
  try {
    const raw = localStorage.getItem("me-profile");
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export const meAtom = atom<MeProfile>(load());

export function useMe() {
  const [me, setMe] = useAtom(meAtom);

  function updateMe(patch: Partial<MeProfile>) {
    setMe((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("me-profile", JSON.stringify(next));
      return next;
    });
  }

  return { me, updateMe };
}
