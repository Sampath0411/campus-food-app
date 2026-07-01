import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";

function friendlyAuthError(message?: string) {
  const raw = (message || "").toLowerCase();
  if (raw.includes("failed to fetch") || raw.includes("network") || raw.includes("timeout")) {
    return "Could not reach the auth server. Check your internet and try again.";
  }
  if (raw.includes("invalid login")) return "Email or password is incorrect.";
  if (raw.includes("email not confirmed")) return "Please confirm your email, then sign in.";
  if (raw.includes("already registered") || raw.includes("already exists")) return "This email already has an account. Please sign in.";
  if (raw.includes("password") && raw.includes("weak")) return "Use a stronger password with uppercase, lowercase, number and symbol.";
  return message || "Something went wrong. Please try again.";
}

export function useAuth() {
  const { user, loading, signOut, refreshUser } = useAuthContext();

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name.trim(),
            phone: phone.replace(/\D/g, ""),
          },
        },
      });

      if (error) throw error;

      if (data.session?.user) await refreshUser();
      return data;
    } catch (error: any) {
      throw new Error(friendlyAuthError(error?.message));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
      await refreshUser();
      return data;
    } catch (error: any) {
      throw new Error(friendlyAuthError(error?.message));
    }
  };

  return { user, loading, signUp, signIn, signOut, refreshUser };
}
