import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { api, loadSession, saveSession } from "../lib/api";
import type { Session } from "../types";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  registerStudent: (payload: {
    name: string;
    email: string;
    password: string;
    healthProfile?: {
      matricNumber?: string;
      ageRange?: string;
      sex?: string;
      allergies?: string;
      chronicConditions?: string;
    };
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const current = loadSession();
      if (!current) {
        setLoading(false);
        return;
      }

      try {
        const user = await api.me();
        const updated = { ...current, user };
        saveSession(updated);
        setSession(updated);
      } catch (_error) {
        saveSession(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async login(payload) {
        const nextSession = await api.login(payload);
        saveSession(nextSession);
        setSession(nextSession);
      },
      async registerStudent(payload) {
        const nextSession = await api.registerStudent(payload);
        saveSession(nextSession);
        setSession(nextSession);
      },
      async logout() {
        await api.logout();
        setSession(null);
      },
      async refreshUser() {
        const current = loadSession();
        if (!current) {
          return;
        }

        const user = await api.me();
        const updated = { ...current, user };
        saveSession(updated);
        setSession(updated);
      }
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
