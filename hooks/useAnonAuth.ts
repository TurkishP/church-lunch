"use client";

import { signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

type UseAnonAuthResult = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export function useAnonAuth(): UseAnonAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (nextUser) => {
        if (nextUser) {
          setUser(nextUser);
          setLoading(false);
          return;
        }

        try {
          await signInAnonymously(auth);
        } catch (authError) {
          setError(
            authError instanceof Error
              ? authError.message
              : "Anonymous authentication failed."
          );
          setLoading(false);
        }
      },
      (authError) => {
        setError(authError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { user, loading, error };
}
