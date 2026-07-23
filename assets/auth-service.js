import { auth, db, USERNAME_DOMAIN } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let cachedSession = null;
let sessionPromise = null;

export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export async function loginWithUsername(username, password) {
  const clean = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(clean)) {
    throw new Error("Tên đăng nhập gồm 3–32 ký tự: chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang.");
  }
  return signInWithEmailAndPassword(auth, usernameToEmail(clean), password);
}

export async function logout() {
  cachedSession = null;
  sessionPromise = null;
  await signOut(auth);
}

async function loadProfile(user) {
  const snapshot = await getDoc(doc(db, "users", user.uid));
  if (!snapshot.exists()) {
    throw new Error("Tài khoản chưa được cấp hồ sơ học tập.");
  }
  const profile = snapshot.data();
  if (profile.active !== true) {
    throw new Error("Tài khoản đang bị khóa.");
  }
  return profile;
}

export function getSession() {
  if (cachedSession) return Promise.resolve(cachedSession);
  if (sessionPromise) return sessionPromise;

  sessionPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        cachedSession = null;
        resolve(null);
        return;
      }
      try {
        const profile = await loadProfile(user);
        cachedSession = { user, profile };
        resolve(cachedSession);
      } catch (error) {
        await signOut(auth).catch(() => {});
        cachedSession = null;
        reject(error);
      }
    }, reject);
  }).finally(() => {
    sessionPromise = null;
  });

  return sessionPromise;
}

export function hasGradeAccess(profile, grade) {
  return Array.isArray(profile.allowedGrades) && profile.allowedGrades.map(Number).includes(Number(grade));
}

export function hasTopicAccess(profile, topicId, grade) {
  if (!hasGradeAccess(profile, grade)) return false;
  const topics = profile.allowedTopics;
  if (!Array.isArray(topics) || topics.length === 0) return true;
  return topics.includes(topicId);
}

export async function requireAccess({ loginPath, deniedPath, grade = null, topicId = null } = {}) {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    sessionStorage.setItem("rentoan-auth-message", error.message);
    window.location.replace(loginPath);
    return null;
  }

  if (!session) {
    sessionStorage.setItem("rentoan-return-url", window.location.href);
    window.location.replace(loginPath);
    return null;
  }

  let allowed = true;
  if (topicId && grade !== null) allowed = hasTopicAccess(session.profile, topicId, grade);
  else if (grade !== null) allowed = hasGradeAccess(session.profile, grade);

  if (!allowed) {
    window.location.replace(deniedPath);
    return null;
  }

  document.documentElement.classList.add("auth-ready");
  return session;
}

export function renderAccount(session, root) {
  const name = session.profile.displayName || session.profile.username || "Người học";
  root.innerHTML = `
    <a class="account-progress" href="${root.dataset.progressHref}">Tiến độ</a>
    <span class="account-name">${escapeHtml(name)}</span>
    <button class="logout-button" type="button">Đăng xuất</button>
  `;
  root.querySelector(".logout-button").addEventListener("click", async () => {
    await logout();
    window.location.replace(root.dataset.loginHref);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
