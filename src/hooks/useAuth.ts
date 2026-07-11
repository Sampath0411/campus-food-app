// Auth removed — stub hook returning a guest user so pages keep working.
const guestUser = {
  id: "guest",
  email: "guest@hostel.app",
  user_metadata: { name: "Guest", phone: "" },
} as any;

export function useAuth() {
  return {
    user: guestUser,
    loading: false,
    signUp: async () => ({ user: guestUser, session: null }),
    signIn: async () => ({ user: guestUser, session: null }),
    signOut: async () => {},
    refreshUser: async () => {},
  };
}
