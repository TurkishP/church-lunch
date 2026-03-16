"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export type Participant = {
  id: string;
  displayName: string;
  createdAt: Date | null;
};

export function subscribeParticipants(
  sessionId: string,
  onData: (participants: Record<string, Participant>) => void,
  onError?: (message: string) => void
) {
  return onSnapshot(
    collection(getFirebaseDb(), "sessions", sessionId, "participants"),
    (snapshot) => {
      const nextParticipants: Record<string, Participant> = {};

      snapshot.forEach((participantDoc) => {
        const data = participantDoc.data();
        nextParticipants[participantDoc.id] = {
          id: participantDoc.id,
          displayName: data.displayName ?? "",
          createdAt: data.createdAt?.toDate?.() ?? null
        };
      });

      onData(nextParticipants);
    },
    (error) => {
      onError?.(error.message);
    }
  );
}

export async function saveParticipantDisplayName(
  sessionId: string,
  uid: string,
  displayName: string
) {
  const db = getFirebaseDb();
  const participantRef = doc(db, "sessions", sessionId, "participants", uid);
  const existingParticipant = await getDoc(participantRef);

  await setDoc(
    participantRef,
    existingParticipant.exists()
      ? {
          displayName: displayName.trim()
        }
      : {
          displayName: displayName.trim(),
          createdAt: serverTimestamp()
        },
    { merge: true }
  );
}
