import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (authUser: any) => {
      const fallback = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Guest",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "",
      };

      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).maybeSingle();
      if (data) {
        setUser({ id: data.id, name: data.name, email: data.email, phone: data.phone });
        return;
      }

      await supabase.from("users").upsert(fallback);
      setUser(fallback);
    };

    supabase.auth
      .getUser()
      .then(({ data: { user: authUser } }) => (authUser ? loadProfile(authUser) : setUser(null)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await loadProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
          phone,
        },
      },
    });

    if (error) throw error;

    // Insert user profile after auth signup
    if (data.user && data.session) {
      const { error: insertError } = await supabase.from("users").upsert({
        id: data.user.id,
        name,
        email,
        phone,
      });
      if (insertError) throw insertError;
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signUp, signIn, signOut };
}
