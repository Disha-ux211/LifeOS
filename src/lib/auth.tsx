import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USER = {
  id: 'demo-lifeos-user',
  email: 'demo@lifeos.app',
  display_name: 'Disha',
};

const DEMO_PASSWORD = 'lifeos123';

function createDemoUser(): User {
  return {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    app_metadata: {},
    user_metadata: {
      display_name: DEMO_USER.display_name,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('lifeos_demo_logged_in');

    if (loggedIn === 'true') {
      const demoUser = createDemoUser();

      setUser(demoUser);
      setSession({
        access_token: 'demo-access-token',
        refresh_token: 'demo-refresh-token',
        expires_in: 86400,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        token_type: 'bearer',
        user: demoUser,
      } as Session);

      setProfile({
        id: DEMO_USER.id,
        display_name: DEMO_USER.display_name,
      } as Profile);
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email.trim().toLowerCase() !== DEMO_USER.email || password !== DEMO_PASSWORD) {
      return {
        error: `Demo login: use ${DEMO_USER.email} and password ${DEMO_PASSWORD}`,
      };
    }

    const demoUser = createDemoUser();

    localStorage.setItem('lifeos_demo_logged_in', 'true');

    setUser(demoUser);
    setSession({
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      token_type: 'bearer',
      user: demoUser,
    } as Session);

    setProfile({
      id: DEMO_USER.id,
      display_name: DEMO_USER.display_name,
    } as Profile);

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const demoUser = {
      ...createDemoUser(),
      email,
      user_metadata: {
        display_name: displayName || 'Disha',
      },
    } as User;

    localStorage.setItem('lifeos_demo_logged_in', 'true');

    setUser(demoUser);
    setSession({
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      token_type: 'bearer',
      user: demoUser,
    } as Session);

    setProfile({
      id: DEMO_USER.id,
      display_name: displayName || 'Disha',
    } as Profile);

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('lifeos_demo_logged_in');
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    setProfile((current) =>
      current ? { ...current, ...updates } : current
    );
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}