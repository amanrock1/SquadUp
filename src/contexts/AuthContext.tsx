// ============================================================
// Auth Context — Firebase Authentication Provider
// Provides login, signup, Google auth, and user state
// ============================================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, getFirebaseAuth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/lib/db';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore
  const loadProfile = async (uid: string) => {
    try {
      const p = await getUserProfile(uid);
      setProfile(p);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/password login
  const login = async (email: string, password: string) => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) throw new Error('Firebase configuration missing');
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    await loadProfile(result.user.uid);
  };

  // Email/password signup + create profile
  const signup = async (email: string, password: string, username: string) => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) throw new Error('Firebase configuration missing');
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    await updateProfile(result.user, { displayName: username });
    await createUserProfile(result.user.uid, {
      username,
      email,
    });
    await loadProfile(result.user.uid);
  };

  // Google sign-in
  const loginWithGoogle = async () => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) throw new Error('Firebase configuration missing');
    const result = await signInWithPopup(authInstance, googleProvider);
    // Check if profile exists, create if not
    const existing = await getUserProfile(result.user.uid);
    if (!existing) {
      await createUserProfile(result.user.uid, {
        username: result.user.displayName || 'Gamer',
        email: result.user.email || '',
      });
    }
    await loadProfile(result.user.uid);
  };

  // Logout
  const logout = async () => {
    const authInstance = getFirebaseAuth();
    if (authInstance) {
      await signOut(authInstance);
    }
    setProfile(null);
  };

  // Refresh profile from DB
  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
