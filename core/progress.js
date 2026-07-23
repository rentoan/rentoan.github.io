import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function read(id) {
  const user = auth.currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn.");
  const snapshot = await getDoc(doc(db, "users", user.uid, "progress", id));
  return snapshot.exists() ? snapshot.data() : {};
}

export async function saveAttempt({ grade, topicId, level, skillId, isCorrect }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn.");

  const date = localDateKey();
  const shared = {
    attempted: increment(1),
    correct: increment(isCorrect ? 1 : 0),
    updatedAt: serverTimestamp()
  };
  const batch = writeBatch(db);
  const base = ["users", user.uid, "progress"];

  batch.set(doc(db, ...base, "summary"), {
    type: "summary", ...shared, lastActiveDate: date
  }, { merge: true });
  batch.set(doc(db, ...base, `day-${date}`), {
    type: "daily", date, ...shared
  }, { merge: true });
  batch.set(doc(db, ...base, topicId), {
    type: "topic", grade, topicId, currentLevel: level, ...shared
  }, { merge: true });
  batch.set(doc(db, ...base, `${topicId}-level-${level}`), {
    type: "level", grade, topicId, level, ...shared
  }, { merge: true });
  if (skillId) {
    batch.set(doc(db, ...base, `${topicId}-skill-${skillId}`), {
      type: "skill", grade, topicId, skillId, ...shared
    }, { merge: true });
  }
  await batch.commit();
}

export async function loadDashboard(topicIds = []) {
  const date = localDateKey();
  const [today, summary, ...topics] = await Promise.all([
    read(`day-${date}`),
    read("summary"),
    ...topicIds.map(read)
  ]);
  return { today, summary, topics };
}

export async function loadTopic(topicId, levelCount = 0) {
  const date = localDateKey();
  const [today, summary, topic, ...levels] = await Promise.all([
    read(`day-${date}`),
    read("summary"),
    read(topicId),
    ...Array.from({ length: levelCount }, (_, i) => read(`${topicId}-level-${i + 1}`))
  ]);
  return { today, summary, topic, levels };
}

export function percent(correct = 0, attempted = 0) {
  return attempted ? Math.round((correct / attempted) * 100) : 0;
}

export function masteryLabel(correct = 0, attempted = 0) {
  if (!attempted) return "Chưa luyện";
  const rate = percent(correct, attempted);
  if (attempted >= 10 && rate >= 85) return "Vững";
  if (attempted >= 5 && rate >= 70) return "Đang tiến bộ";
  return "Cần luyện thêm";
}
