import {
  requireLogin,
  mountAccount,
  displayName,
  hasGrade,
  hasTopic,
  isWaitingForPermission
} from "../core/auth.js";
import { loadDashboard, percent } from "../core/progress.js";

const session = await requireLogin("./login.html");
if (!session) throw new Error("Chưa đăng nhập.");
mountAccount(document.getElementById("accountArea"), session, {
  loginHref: "./login.html",
  progressHref: "./tien-do.html"
});
document.getElementById("welcomeName").textContent = displayName(session);

const waitingBanner = document.getElementById("waitingBanner");
if (isWaitingForPermission(session.profile)) {
  waitingBanner.hidden = false;
}

const grades = [6, 7, 8, 9];
grades.forEach(grade => {
  const card = document.querySelector(`[data-grade="${grade}"]`);
  const allowed = hasGrade(session.profile, grade);
  const action = card.querySelector("[data-action]");
  const badge = card.querySelector("[data-badge]");
  if (allowed && grade === 8) {
    badge.textContent = "Đã cấp quyền";
    badge.className = "badge badge-open";
    action.outerHTML = '<a class="button button-primary" href="./lop-8/index.html">Vào học</a>';
  } else if (allowed) {
    badge.textContent = "Đã cấp quyền";
    badge.className = "badge badge-soon";
    action.textContent = "Nội dung đang xây dựng";
    action.disabled = true;
  } else {
    badge.textContent = "Chưa cấp quyền";
    badge.className = "badge badge-locked";
    action.textContent = "Đã khóa";
    action.disabled = true;
  }
});

const continueButton = document.getElementById("continueButton");
if (!hasTopic(session.profile, "lop8-chude1", 8)) {
  continueButton.textContent = "Chờ cấp quyền";
  continueButton.className = "button button-ghost";
  continueButton.removeAttribute("href");
  continueButton.setAttribute("aria-disabled", "true");
}

try {
  const { today, summary, topics } = await loadDashboard(["lop8-chude1", "lop8-chude2"]);
  const todayRate = percent(today.correct, today.attempted);
  document.getElementById("todayAttempted").textContent = today.attempted || 0;
  document.getElementById("todayCorrect").textContent = today.correct || 0;
  document.getElementById("todayRate").textContent = `${todayRate}%`;
  document.getElementById("allAttempted").textContent = summary.attempted || 0;
  const topic = topics[0] || {};
  const topicRate = percent(topic.correct, topic.attempted);
  document.getElementById("continueText").textContent = topic.attempted
    ? `Bạn đã làm ${topic.attempted} câu ở Chủ đề 1, đúng ${topicRate}%.`
    : hasTopic(session.profile, "lop8-chude1", 8)
      ? "Bạn chưa luyện Chủ đề 1. Hãy bắt đầu bằng Mức 1."
      : "Tài khoản đã sẵn sàng. Giáo viên sẽ mở lớp và chủ đề phù hợp cho bạn.";
} catch (error) {
  document.getElementById("continueText").textContent = `Chưa tải được tiến độ: ${error.message}`;
}
