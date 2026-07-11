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
    signUp: async (_name?: string, _email?: string, _phone?: string, _password?: string) => ({ user: guestUser, session: { user: guestUser } as any }),
    signIn: async (_email?: string, _password?: string) => ({ user: guestUser, session: { user: guestUser } as any }),
    signOut: async () => {},
    refreshUser: async () => {},
  };
}
