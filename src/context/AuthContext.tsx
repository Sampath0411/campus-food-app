import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLocalUser: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOCAL_AUTH_KEY = "bb:local-auth-user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearStaleAuth = () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-") || key.includes("supabase.auth.token"))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // localStorage can be unavailable in strict browser modes.
    }
  };

  const withTimeout = async <T,>(promise: Promise<T>, ms = 8000): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Authentication service timed out")), ms);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  const toFallbackProfile = (authUser: SupabaseUser): UserProfile => ({
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Student",
    email: authUser.email || "",
    phone: authUser.user_metadata?.phone || "",
  });

  const readLocalUser = (): UserProfile | null => {
    try {
      const raw = localStorage.getItem(LOCAL_AUTH_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  };

  const setLocalUser = (profile: UserProfile) => {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const loadProfile = async (authUser: SupabaseUser) => {
    const fallback = toFallbackProfile(authUser);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setUser({ id: data.id, name: data.name, email: data.email, phone: data.phone });
      } else {
        // We try an upsert here just in case the trigger didn't run or is missing
        // This will only work if the user is authenticated (which they are here)
        const { error: upsertError } = await supabase.from("users").upsert(fallback);
        if (!upsertError) {
          setUser(fallback);
        } else {
          console.error("Error upserting profile:", upsertError);
          setUser(fallback); // Still set user state so they can use the app
        }
      }
    } catch (err) {
      console.error("Unexpected error in loadProfile:", err);
      setUser(fallback);
    }
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadProfile(authUser);
    } else {
      setUser(readLocalUser());
    }
  };

  useEffect(() => {
    let mounted = true;
    const finish = () => mounted && setLoading(false);

    // Initial load
    withTimeout(supabase.auth.getUser())
      .then(({ data: { user: authUser } }) => {
        if (!mounted) return;
        if (authUser) {
          loadProfile(authUser).finally(finish);
        } else {
          setUser(readLocalUser());
          finish();
        }
      })
      .catch((err) => {
        console.error("Auth bootstrap failed:", err);
        clearStaleAuth();
        setUser(readLocalUser());
        finish();
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          await loadProfile(session.user);
        }
      } else {
        setUser(readLocalUser());
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Network can be blocked; local cleanup still signs the user out of the app.
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser, setLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
