import { requireLogin, mountAccount, displayName } from "../core/auth.js";
import { loadTopic, percent, masteryLabel } from "../core/progress.js";

const session = await requireLogin("./login.html");
if (!session) throw new Error("Chưa đăng nhập.");
mountAccount(document.getElementById("accountArea"), session, {
  loginHref: "./login.html",
  progressHref: "./tien-do.html"
});
document.getElementById("studentName").textContent = displayName(session);

try {
  const data = await loadTopic("lop8-chude1", 7);
  const todayRate = percent(data.today.correct, data.today.attempted);
  const allRate = percent(data.summary.correct, data.summary.attempted);
  const topicRate = percent(data.topic.correct, data.topic.attempted);
  document.getElementById("todayAttempted").textContent = data.today.attempted || 0;
  document.getElementById("todayCorrect").textContent = data.today.correct || 0;
  document.getElementById("todayRate").textContent = `${todayRate}%`;
  document.getElementById("allAttempted").textContent = data.summary.attempted || 0;
  document.getElementById("allAttemptedDetail").textContent = data.summary.attempted || 0;
  document.getElementById("allCorrect").textContent = data.summary.correct || 0;
  document.getElementById("allRate").textContent = `${allRate}%`;
  document.getElementById("topicAttempted").textContent = `${data.topic.attempted || 0} câu`;
  document.getElementById("topicRate").textContent = `${topicRate}%`;
  document.getElementById("topicBar").style.width = `${topicRate}%`;
  document.getElementById("topicStatus").textContent = masteryLabel(data.topic.correct, data.topic.attempted);

  const names = [
    "Thu gọn hạng tử đồng dạng", "Bỏ ngoặc và đổi dấu", "Phân phối phép nhân",
    "Thu gọn nhiều bước", "Nhân hai đa thức", "Hằng đẳng thức", "Biến đổi tổng hợp"
  ];
  const levelList = document.getElementById("levelProgress");
  let recommendation = null;
  data.levels.forEach((level, index) => {
    const rate = percent(level.correct, level.attempted);
    const row = document.createElement("div");
    row.className = "level-row";
    row.innerHTML = `
      <div class="level-row-head"><strong>Mức ${index + 1}: ${names[index]}</strong><span>${level.attempted || 0} câu · ${rate}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${rate}%"></div></div>`;
    levelList.appendChild(row);
    if (!recommendation && level.attempted >= 3 && rate < 70) recommendation = { index, rate, name: names[index] };
  });

  const recommendationText = document.getElementById("recommendationText");
  if (recommendation) {
    recommendationText.textContent = `Nên luyện lại Mức ${recommendation.index + 1}: ${recommendation.name}. Tỉ lệ hiện tại là ${recommendation.rate}%.`;
  } else if ((data.topic.attempted || 0) === 0) {
    recommendationText.textContent = "Hãy bắt đầu từ Mức 1 và làm khoảng 10 câu trước khi đánh giá mức độ thành thạo.";
  } else {
    recommendationText.textContent = "Chưa có mức nào dưới ngưỡng 70% sau ít nhất 3 câu. Bạn có thể tiếp tục mức đang học.";
  }
} catch (error) {
  document.getElementById("progressError").textContent = `Không tải được tiến độ: ${error.message}`;
}
