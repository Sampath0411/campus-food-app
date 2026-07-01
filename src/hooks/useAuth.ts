import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, loading, signOut, refreshUser } = useAuthContext();

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
    
    // Note: Profile creation is handled by the DB trigger handle_new_user()
    // or by the first loadProfile call when the user signs in.
    
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

  return { user, loading, signUp, signIn, signOut, refreshUser };
}
