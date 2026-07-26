import { auth, db, USERNAME_DOMAIN } from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

let cachedSession = null;
let pendingSession = null;

export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export async function login(username, password) {
  const clean = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(clean)) {
    throw new Error("Tên đăng nhập gồm 3–32 ký tự: chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang.");
  }
  const credential = await signInWithEmailAndPassword(auth, usernameToEmail(clean), password);
  cachedSession = null;
  pendingSession = null;
  return credential;
}

export async function logout() {
  cachedSession = null;
  pendingSession = null;
  await signOut(auth);
}

function usernameFromUser(user) {
  const email = String(user.email || "").toLowerCase();
  const suffix = `@${USERNAME_DOMAIN}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email.split("@")[0];
}

async function createInitialProfile(user) {
  const username = usernameFromUser(user);
  const initialProfile = {
    username,
    displayName: username,
    role: "student",
    active: true,
    allowedGrades: [],
    allowedTopics: [],
    parentEmail: "",
    emailReportEnabled: false,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, "users", user.uid), initialProfile);
  return { ...initialProfile, createdAt: null };
}

async function readProfile(user) {
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const profile = snapshot.exists() ? snapshot.data() : await createInitialProfile(user);
  if (profile.active !== true) throw new Error("Tài khoản đang bị khóa.");
  return profile;
}

export function getSession() {
  if (cachedSession) return Promise.resolve(cachedSession);
  if (pendingSession) return pendingSession;

  pendingSession = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      unsubscribe();
      if (!user) return resolve(null);
      try {
        const profile = await readProfile(user);
        cachedSession = { user, profile };
        resolve(cachedSession);
      } catch (error) {
        await signOut(auth).catch(() => {});
        reject(error);
      }
    }, reject);
  }).finally(() => { pendingSession = null; });

  return pendingSession;
}

export function isTeacher(profile) {
  return profile?.role === "teacher";
}

export function hasGrade(profile, grade) {
  if (isTeacher(profile)) return true;
  return Array.isArray(profile.allowedGrades)
    && profile.allowedGrades.map(Number).includes(Number(grade));
}

export function hasTopic(profile, topicId, grade) {
  if (isTeacher(profile)) return true;
  if (!hasGrade(profile, grade)) return false;
  if (!Array.isArray(profile.allowedTopics) || profile.allowedTopics.length === 0) return true;
  return profile.allowedTopics.includes(topicId);
}

export function isWaitingForPermission(profile) {
  if (isTeacher(profile)) return false;
  return !Array.isArray(profile.allowedGrades) || profile.allowedGrades.length === 0;
}

export async function requireLogin(loginPath) {
  try {
    const session = await getSession();
    if (!session) {
      sessionStorage.setItem("rentoan-return-url", window.location.href);
      window.location.replace(loginPath);
      return null;
    }
    document.documentElement.classList.add("auth-ready");
    return session;
  } catch (error) {
    sessionStorage.setItem("rentoan-auth-message", error.message);
    window.location.replace(loginPath);
    return null;
  }
}

export async function requireAccess({ loginPath, deniedPath, grade, topicId = null }) {
  const session = await requireLogin(loginPath);
  if (!session) return null;
  const allowed = topicId
    ? hasTopic(session.profile, topicId, grade)
    : hasGrade(session.profile, grade);
  if (!allowed) {
    window.location.replace(deniedPath);
    return null;
  }
  return session;
}

export function displayName(session) {
  return session.profile.displayName || session.profile.username || "Người học";
}

export function mountAccount(root, session, { loginHref, progressHref, adminHref = null }) {
  const resolvedAdminHref = adminHref || progressHref.replace(/tien-do\.html$/, "admin/index.html");
  const adminLink = isTeacher(session.profile)
    ? `<a class="nav-link account-admin" href="${resolvedAdminHref}">Quản trị</a>`
    : "";
  root.innerHTML = `
    ${adminLink}
    <a class="nav-link account-progress" href="${progressHref}">Tiến độ</a>
    <span class="account-chip account-name">${escapeHtml(displayName(session))}</span>
    <button class="button button-ghost button-small logout-button" id="logoutButton" type="button">Đăng xuất</button>`;
  root.querySelector("#logoutButton").addEventListener("click", async () => {
    await logout();
    window.location.replace(loginHref);
  });
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
