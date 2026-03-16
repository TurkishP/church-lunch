"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Membership = {
  participantId: string;
  groupId: string;
  joinedAt: Date | null;
};

export function subscribeMemberships(
  sessionId: string,
  onData: (memberships: Record<string, Membership>) => void,
  onError?: (message: string) => void
) {
  return onSnapshot(
    collection(db, "sessions", sessionId, "memberships"),
    (snapshot) => {
      const nextMemberships: Record<string, Membership> = {};

      snapshot.forEach((membershipDoc) => {
        const data = membershipDoc.data();
        nextMemberships[membershipDoc.id] = {
          participantId: data.participantId ?? membershipDoc.id,
          groupId: data.groupId ?? "",
          joinedAt: data.joinedAt?.toDate?.() ?? null
        };
      });

      onData(nextMemberships);
    },
    (error) => {
      onError?.(error.message);
    }
  );
}

export async function upsertMembership(
  sessionId: string,
  uid: string,
  groupId: string
) {
  await setDoc(doc(db, "sessions", sessionId, "memberships", uid), {
    participantId: uid,
    groupId,
    joinedAt: serverTimestamp()
  });
}

export async function leaveGroup(sessionId: string, uid: string) {
  await deleteDoc(doc(db, "sessions", sessionId, "memberships", uid));
}
