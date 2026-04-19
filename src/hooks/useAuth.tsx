import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  user_metadata: {
    display_name: string;
  };
}

export interface Session {
  user: User;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_KEY = "bloody_hell_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: (user: User) => {
        const newSession = { user };
        localStorage.setItem(AUTH_KEY, JSON.stringify(newSession));
        setSession(newSession);
      },
      signOut: async () => {
        localStorage.removeItem(AUTH_KEY);
        setSession(null);
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
