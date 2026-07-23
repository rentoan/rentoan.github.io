import { auth, db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function saveAttempt({ grade, topicId, level, isCorrect }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn.");

  const uid = user.uid;
  const date = localDateKey();
  const batch = writeBatch(db);
  const shared = {
    attempted: increment(1),
    correct: increment(isCorrect ? 1 : 0),
    updatedAt: serverTimestamp()
  };

  batch.set(doc(db, "users", uid, "progress", "summary"), {
    type: "summary",
    ...shared,
    lastActiveDate: date
  }, { merge: true });

  batch.set(doc(db, "users", uid, "progress", `day-${date}`), {
    type: "daily",
    date,
    ...shared
  }, { merge: true });

  batch.set(doc(db, "users", uid, "progress", topicId), {
    type: "topic",
    grade,
    topicId,
    currentLevel: level,
    ...shared
  }, { merge: true });

  batch.set(doc(db, "users", uid, "progress", `${topicId}-level-${level}`), {
    type: "level",
    grade,
    topicId,
    level,
    ...shared
  }, { merge: true });

  await batch.commit();
}

async function readProgressDoc(uid, id) {
  const snapshot = await getDoc(doc(db, "users", uid, "progress", id));
  return snapshot.exists() ? snapshot.data() : {};
}

export async function loadTopicDashboard(topicId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập.");
  const date = localDateKey();
  const [today, summary, topic] = await Promise.all([
    readProgressDoc(user.uid, `day-${date}`),
    readProgressDoc(user.uid, "summary"),
    readProgressDoc(user.uid, topicId)
  ]);
  return { today, summary, topic };
}

export async function loadAllProgress(topicIds = []) {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập.");
  const date = localDateKey();
  const [today, summary, ...topics] = await Promise.all([
    readProgressDoc(user.uid, `day-${date}`),
    readProgressDoc(user.uid, "summary"),
    ...topicIds.map(id => readProgressDoc(user.uid, id))
  ]);
  return { today, summary, topics };
}
