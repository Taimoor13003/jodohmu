"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

const auth = getAuth(app);

type UserRole = "candidate" | "worker" | "admin";

interface AuthContextType {
  user: User | null;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: "candidate" });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("candidate");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user?.email) {
        setRole("candidate");
        return;
      }

      try {
        const emailLower = user.email.toLowerCase();

        // Prefer lookup by uid
        const roleDoc = await getDoc(doc(db, "user_roles", user.uid));
        if (roleDoc.exists()) {
          const data = roleDoc.data() as { role?: UserRole };
          if (data.role === "admin" || data.role === "worker" || data.role === "candidate") {
            setRole(data.role);
            return;
          }
        }

        // Fallback to legacy email lookup
        const roleSnap = await getDocs(
          query(collection(db, "user_roles"), where("email", "==", emailLower), limit(1))
        );

        if (!roleSnap.empty) {
          const data = roleSnap.docs[0].data() as { role?: UserRole };
          if (data.role === "admin" || data.role === "worker" || data.role === "candidate") {
            setRole(data.role);
            return;
          }
        }

        // Fallback: treat jodohmu.com emails as worker, specific admin email as admin
        if (emailLower === "admin@jodohmu.com") {
          setRole("admin");
        } else if (emailLower.endsWith("@jodohmu.com")) {
          setRole("worker");
        } else {
          setRole("candidate");
        }
      } catch (error) {
        console.error("Error fetching user role", error);
        setRole("candidate");
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, role }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
