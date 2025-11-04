"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

type UserRole = "candidate" | "worker" | "admin";

// Mock function to get user role
const getUserRole = (user: User | null): UserRole => {
  if (!user) return "candidate";
  if (user.email === "admin@jodohmu.com") return "admin";
  if (user.email?.endsWith("@jodohmu.com")) return "worker";
  return "candidate";
};

interface AuthContextType {
  user: User | null;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: "candidate" });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("candidate");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setRole(getUserRole(user));
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, role }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
