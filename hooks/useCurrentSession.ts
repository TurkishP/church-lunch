"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

type UseCurrentSessionResult = {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
};

export function useCurrentSession(): UseCurrentSessionResult {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionRef = doc(db, "meta", "currentSession");

    const unsubscribe = onSnapshot(
      sessionRef,
      (snapshot) => {
        setSessionId(snapshot.data()?.sessionId ?? null);
        setLoading(false);
      },
      (sessionError) => {
        setError(sessionError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { sessionId, loading, error };
}
