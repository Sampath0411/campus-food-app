import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

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
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user metadata
        supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
              });
            }
          });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
              });
            }
          });
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
        data: {
          name,
          phone,
        },
      },
    });

    if (error) throw error;

    // Insert user profile
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        name,
        email,
        phone,
      });
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
