import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) {
        // Defer Supabase calls to avoid recursion
        setTimeout(async () => {
          const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
          setIsAdmin((data ?? []).some((r: { role: string }) => r.role === "admin"));
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
        setIsAdmin((roles ?? []).some((r: { role: string }) => r.role === "admin"));
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading, isAdmin };
}
