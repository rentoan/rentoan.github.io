import { requireAccess, renderAccount } from "./auth-service.js";
import { loadAllProgress } from "./progress-service.js";

const topics = [{ id: "lop8-chude1", title: "Toán 8 · Biến đổi biểu thức đại số", href: "lop-8/chu-de-1/index.html" }];
const session = await requireAccess({ loginPath: "login.html", deniedPath: "khong-co-quyen.html" });
if (session) {
  renderAccount(session, document.getElementById("accountBox"));
  document.getElementById("welcomeText").textContent = `${session.profile.displayName || session.profile.username}, đây là kết quả được đồng bộ theo tài khoản của bạn.`;
  try {
    const data = await loadAllProgress(topics.map(t => t.id));
    const attempted = data.today.attempted || 0;
    const correct = data.today.correct || 0;
    document.getElementById("pTodayAttempted").textContent = attempted;
    document.getElementById("pTodayCorrect").textContent = correct;
    document.getElementById("pTodayAccuracy").textContent = attempted ? `${Math.round(correct / attempted * 100)}%` : "0%";
    document.getElementById("pTotalAttempted").textContent = data.summary.attempted || 0;
    document.getElementById("topicProgressList").innerHTML = topics.map((topic, i) => {
      const p = data.topics[i] || {};
      const a = p.attempted || 0, c = p.correct || 0, rate = a ? Math.round(c / a * 100) : 0;
      return `<a class="topic-progress-card" href="${topic.href}"><div><span>${topic.title}</span><strong>${c} đúng / ${a} câu</strong></div><div class="topic-rate">${rate}%</div></a>`;
    }).join("");
  } catch (error) {
    document.getElementById("topicProgressList").innerHTML = `<p class="data-error">Chưa tải được dữ liệu: ${error.message}</p>`;
  }
}
