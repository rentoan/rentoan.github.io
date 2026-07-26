import { requireAccess, mountAccount } from "../../core/auth.js";
import { saveAttempt, loadTopic, localDateKey } from "../../core/progress.js";
import { TOPIC } from "./config.js";
import { generateQuestion } from "./generator.js";
import { equivalent, diagnose, pretty } from "./checker.js";

const session = await requireAccess({
  loginPath: "../../login.html",
  deniedPath: "../../khong-co-quyen.html",
  grade: TOPIC.grade,
  topicId: TOPIC.id
});
if (!session) throw new Error("Không có quyền truy cập.");
mountAccount(document.getElementById("accountBox"), session, {
  loginHref: "../../login.html",
  progressHref: "../../tien-do.html"
});

let currentLevel = 0;
let currentQuestion = null;
let correctCount = 0;
let totalCount = 0;
let questionSubmitted = false;

const levelList = document.getElementById("levelList");
const levelBadge = document.getElementById("levelBadge");
const levelTitle = document.getElementById("levelTitle");
const expression = document.getElementById("expression");
const answerArea = document.getElementById("answerArea");
const feedback = document.getElementById("feedback");
const levelTip = document.getElementById("levelTip");

TOPIC.levels.forEach((level, index) => {
  const button = document.createElement("button");
  button.className = "level-item";
  button.innerHTML = `<span class="level-number">${index + 1}</span><span class="level-name">${level.title}</span>`;
  button.addEventListener("click", () => selectLevel(index));
  levelList.appendChild(button);
});

function selectLevel(index) {
  currentLevel = index;
  [...levelList.children].forEach((element, i) => element.classList.toggle("active", i === index));
  levelBadge.textContent = `Mức ${index + 1}`;
  levelTitle.textContent = TOPIC.levels[index].title;
  levelTip.textContent = TOPIC.levels[index].tip;
  newQuestion();
}

function newQuestion() {
  currentQuestion = generateQuestion(currentLevel);
  questionSubmitted = false;
  expression.textContent = pretty(currentQuestion.expression);
  feedback.className = "feedback hidden";
  feedback.innerHTML = "";
  answerArea.innerHTML = "";

  if (currentQuestion.type === "text") {
    const input = document.createElement("input");
    input.className = "answer-input";
    input.id = "answerInput";
    input.placeholder = "Nhập đáp án, ví dụ: 6x(3x + 4)";
    input.autocomplete = "off";
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") submitAnswer();
    });
    answerArea.appendChild(input);
    setTimeout(() => input.focus(), 30);
  } else {
    currentQuestion.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = "choice";
      label.innerHTML = `<input type="radio" name="choice" value="${escapeHtml(choice)}"><span>${String.fromCharCode(65 + index)}. ${pretty(choice)}</span>`;
      answerArea.appendChild(label);
    });
  }
}

async function submitAnswer() {
  let userAnswer = "";
  if (currentQuestion.type === "text") {
    userAnswer = document.getElementById("answerInput").value;
    if (!userAnswer.trim()) return showFeedback(false, "Bạn chưa nhập đáp án.", false);
  } else {
    const selected = document.querySelector('input[name="choice"]:checked');
    if (!selected) return showFeedback(false, "Bạn chưa chọn đáp án.", false);
    userAnswer = selected.value;
  }

  const isCorrect = equivalent(userAnswer, currentQuestion);
  if (!questionSubmitted) {
    questionSubmitted = true;
    totalCount++;
    if (isCorrect) correctCount++;
    updateScore();
    await recordCloudProgress(isCorrect);
  }

  const message = isCorrect
    ? "Chính xác. Em đã đặt nhân tử chung đúng."
    : `${diagnose(userAnswer, currentQuestion)} Đáp án đúng là ${pretty(currentQuestion.answer)}.`;
  showFeedback(isCorrect, message, true);
}

function showFeedback(isCorrect, message, withExplanation) {
  feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedback.innerHTML = `<strong>${escapeHtml(message)}</strong>${withExplanation ? `<span>${escapeHtml(currentQuestion.explanation)}</span>` : ""}`;
}

function updateScore() {
  document.getElementById("sessionScore").textContent = `${correctCount} đúng / ${totalCount} câu`;
  const percent = totalCount ? Math.round(correctCount / totalCount * 100) : 0;
  document.getElementById("progressBar").style.width = `${percent}%`;
}

async function recordCloudProgress(isCorrect) {
  try {
    await saveAttempt({
      grade: TOPIC.grade,
      topicId: TOPIC.id,
      level: currentLevel + 1,
      skillId: `level-${currentLevel + 1}`,
      isCorrect
    });
    await renderStoredProgress();
  } catch (error) {
    feedback.className = "feedback incorrect";
    feedback.innerHTML += `<span>Không lưu được tiến độ: ${escapeHtml(error.message)}</span>`;
  }
}

async function renderStoredProgress() {
  const key = localDateKey();
  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric"
  }).format(new Date(`${key}T00:00:00`));

  try {
    const { today, summary } = await loadTopic(TOPIC.id, TOPIC.levelCount);
    const answered = today.attempted || 0;
    const correct = today.correct || 0;
    const accuracy = answered ? Math.round(correct / answered * 100) : 0;
    document.getElementById("todayAnswered").textContent = answered;
    document.getElementById("todayCorrect").textContent = correct;
    document.getElementById("todayAccuracy").textContent = `${accuracy}%`;
    document.getElementById("allTimeAnswered").textContent = summary.attempted || 0;
  } catch (error) {
    document.querySelector(".storage-note").textContent = `Chưa tải được tiến độ: ${error.message}`;
  }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

document.getElementById("submitBtn").addEventListener("click", submitAnswer);
document.getElementById("newQuestionBtn").addEventListener("click", newQuestion);
document.getElementById("showAnswerBtn").addEventListener("click", () => {
  showFeedback(false, `Đáp án: ${pretty(currentQuestion.answer)}.`, true);
});

await renderStoredProgress();
selectLevel(0);
