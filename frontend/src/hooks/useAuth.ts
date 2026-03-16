import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { supabase } from "../lib/supabase";

type Session = { userId: string; token: string } | null;

export const sessionAtom = atom<Session>(null);

export function useAuth() {
  const [session, setSession] = useAtom(sessionAtom);

  useEffect(() => {
    // Rehydrate existing session or sign in anonymously
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setSession({ userId: data.session.user.id, token: data.session.access_token });
      } else {
        const { data: signInData } = await supabase.auth.signInAnonymously();
        if (signInData.session) {
          setSession({ userId: signInData.session.user.id, token: signInData.session.access_token });
        }
      }
    });

    // Keep token fresh on auto-refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) setSession({ userId: s.user.id, token: s.access_token });
    });

    return () => subscription.unsubscribe();
  }, []);

  return session;
}
