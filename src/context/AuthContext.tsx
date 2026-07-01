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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser: SupabaseUser) => {
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
        // Fallback or attempt to create if missing (though trigger should handle it)
        const fallback = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Guest",
          email: authUser.email || "",
          phone: authUser.user_metadata?.phone || "",
        };
        
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
    }
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadProfile(authUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial load
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        loadProfile(authUser).finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          await loadProfile(session.user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
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
