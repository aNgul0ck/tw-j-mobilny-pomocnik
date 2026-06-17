import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbService } from './db';

export type UserRole = 'admin' | 'client';

export interface UserProfile {
  email: string;
  role: UserRole;
  profileIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: { email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAIL = 'antek.golik@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrCreateProfile = async (email: string) => {
    const lower = email.toLowerCase();
    const users = await dbService.getUsers();
    let profile = users.find((u) => u.email.toLowerCase() === lower);

    if (!profile) {
      const role: UserRole = lower === ADMIN_EMAIL ? 'admin' : 'client';
      const profileIds = role === 'admin' ? ['bubble-auto'] : [];
      await dbService.createUser(email, role, profileIds);
      profile = { email, role, profileIds };
    }

    setUserProfile(profile);
  };

  const refreshProfile = async () => {
    if (user?.email) await loadOrCreateProfile(user.email);
  };

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('findmy_user') : null;
    if (stored) {
      const parsed = JSON.parse(stored) as { email: string };
      setUser(parsed);
      loadOrCreateProfile(parsed.email).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string) => {
    const cleanEmail = email.trim();
    const u = { email: cleanEmail };
    if (typeof window !== 'undefined') {
      localStorage.setItem('findmy_user', JSON.stringify(u));
    }
    setUser(u);
    await loadOrCreateProfile(cleanEmail);
  };

  const loginWithEmail = async (email: string) => {
    await signIn(email);
  };

  const registerWithEmail = async (email: string) => {
    await signIn(email);
  };

  const logout = async () => {
    if (typeof window !== 'undefined') localStorage.removeItem('findmy_user');
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, loginWithEmail, registerWithEmail, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
