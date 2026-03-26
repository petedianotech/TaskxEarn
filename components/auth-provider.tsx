"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const setupRecaptcha = (containerId: string) => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
      });
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    if (!(window as any).recaptchaVerifier) {
      throw new Error("Recaptcha not initialized");
    }
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, (window as any).recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error("Phone sign-in error:", error);
      throw error;
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logOut, setupRecaptcha, signInWithPhone }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
