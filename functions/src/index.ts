import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

function getCurrentSeoulSunday(date = new Date()) {
  const seoulDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Seoul"
    })
  );

  const sunday = new Date(seoulDate);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(sunday.getDate() - sunday.getDay());

  const year = sunday.getFullYear();
  const month = `${sunday.getMonth() + 1}`.padStart(2, "0");
  const day = `${sunday.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const rotateLunchSession = onSchedule(
  {
    schedule: "0 7 * * 0",
    timeZone: "Asia/Seoul",
    region: "asia-northeast3"
  },
  async () => {
    const sessionId = getCurrentSeoulSunday();

    await getFirestore().doc("meta/currentSession").set(
      {
        sessionId,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    logger.info("Updated current lunch session.", { sessionId });
  }
);
