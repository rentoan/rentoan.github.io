import { requireAccess, mountAccount, hasTopic } from "../core/auth.js";
import { loadDashboard, percent, masteryLabel } from "../core/progress.js";

const session = await requireAccess({
  loginPath: "../login.html",
  deniedPath: "../khong-co-quyen.html",
  grade: 8
});
if (!session) throw new Error("Không có quyền.");
mountAccount(document.getElementById("accountArea"), session, {
  loginHref: "../login.html",
  progressHref: "../tien-do.html"
});

const topicId = "lop8-chude1";
const allowed = hasTopic(session.profile, topicId, 8);
const card = document.querySelector(`[data-topic="${topicId}"]`);
if (!allowed) card.classList.add("locked");

try {
  const { topics } = await loadDashboard([topicId]);
  const topic = topics[0] || {};
  const rate = percent(topic.correct, topic.attempted);
  card.querySelector("[data-topic-rate]").textContent = `${rate}%`;
  card.querySelector("[data-topic-attempted]").textContent = `${topic.attempted || 0} câu`;
  card.querySelector("[data-topic-status]").textContent = masteryLabel(topic.correct, topic.attempted);
  card.querySelector(".progress-fill").style.width = `${rate}%`;
} catch (error) {
  card.querySelector("[data-topic-status]").textContent = "Chưa tải được tiến độ";
}

const action = card.querySelector("[data-topic-action]");
if (allowed) {
  action.outerHTML = '<a class="button button-primary" href="./chu-de-1/index.html">Bắt đầu luyện</a>';
} else {
  action.textContent = "Chưa được cấp quyền";
  action.disabled = true;
}
