import { requireAccess, mountAccount } from "../../core/auth.js";
import { saveAttempt, loadTopic, localDateKey } from "../../core/progress.js";

const session = await requireAccess({
  loginPath: "../../login.html",
  deniedPath: "../../khong-co-quyen.html",
  grade: 8,
  topicId: "lop8-chude1"
});

if (!session) throw new Error("Không có quyền truy cập.");
mountAccount(document.getElementById("accountBox"), session, { loginHref: "../../login.html", progressHref: "../../tien-do.html" });

const levels = [
  {
    title: "Thu gọn hạng tử đồng dạng",
    tip: "Chỉ cộng hoặc trừ các hệ số của những hạng tử có cùng phần biến.",
    generator: () => {
      const a = rand(2, 9), b = rand(2, 9), sign = Math.random() < .5 ? 1 : -1;
      const result = a + sign * b;
      return textQuestion(`${a}x ${sign > 0 ? "+" : "−"} ${b}x`, formatTerm(result, "x"),
        `Hai hạng tử đều có phần biến x. Ta tính ${a} ${sign > 0 ? "+" : "−"} ${b} = ${result}.`);
    }
  },
  {
    title: "Bỏ ngoặc và đổi dấu",
    tip: "Dấu trừ trước ngoặc làm đổi dấu tất cả hạng tử bên trong ngoặc.",
    generator: () => {
      const a = rand(2, 8), b = rand(1, 7), c = rand(1, 8);
      // ax − (bx + c) = (a − b)x − c
      const answer = `${a-b}x${signed(-c)}`;
      return textQuestion(`${a}x − (${b}x + ${c})`, normalize(answer),
        `Dấu “−” trước ngoặc làm đổi dấu từng hạng tử: ${a}x − (${b}x + ${c}) = ${a}x − ${b}x − ${c}. Thu gọn được ${normalize(answer)}.`);
    }
  },
  {
    title: "Phân phối phép nhân",
    tip: "Nhân số đứng ngoài ngoặc với từng hạng tử ở trong ngoặc.",
    generator: () => {
      const a = rand(2, 7), b = rand(1, 6), c = rand(1, 8), negative = Math.random() < .35;
      const k = negative ? -a : a;
      const expression = `${k < 0 ? "−" : ""}${Math.abs(k)}(${b}x + ${c})`;
      const answer = `${k*b}x${signed(k*c)}`;
      return textQuestion(expression, normalize(answer),
        `Phân phối ${k} vào trong ngoặc: ${k}·${b}x + ${k}·${c} = ${normalize(answer)}.`);
    }
  },
  {
    title: "Thu gọn biểu thức nhiều bước",
    tip: "Mở ngoặc trước, sau đó nhóm các hạng tử đồng dạng.",
    generator: () => {
      const a = rand(2, 5), b = rand(1, 5), c = rand(2, 5), d = rand(1, 5);
      const x = a-c, constant = a*b + c*d;
      const answer = `${x}x${signed(constant)}`;
      return textQuestion(`${a}(x + ${b}) − ${c}(x − ${d})`, normalize(answer),
        `Khai triển: ${a}x + ${a*b} − ${c}x + ${c*d}. Nhóm hạng tử đồng dạng để được ${normalize(answer)}.`);
    }
  },
  {
    title: "Nhân hai đa thức",
    tip: "Nhân từng hạng tử của đa thức thứ nhất với từng hạng tử của đa thức thứ hai.",
    generator: () => {
      const a = rand(1, 6), b = rand(1, 6);
      const answer = `x^2+${a+b}x+${a*b}`;
      const choices = shuffle([
        normalize(answer),
        normalize(`x^2+${a*b}x+${a+b}`),
        normalize(`x^2+${a+b}x-${a*b}`),
        normalize(`2x^2+${a+b}x+${a*b}`)
      ]);
      return choiceQuestion(`(x + ${a})(x + ${b})`, normalize(answer), choices,
        `Ta có x·x = x², hai hạng tử giữa cộng lại thành (${a}+${b})x, và ${a}·${b} = ${a*b}.`);
    }
  },
  {
    title: "Hằng đẳng thức đáng nhớ",
    tip: "Nhận dạng bình phương của một tổng hoặc một hiệu trước khi tính.",
    generator: () => {
      const a = rand(1, 7), minus = Math.random() < .5;
      const middle = minus ? -2*a : 2*a;
      const answer = `x^2${signed(middle, "x")}${signed(a*a)}`;
      const symbol = minus ? "−" : "+";
      return choiceQuestion(`(x ${symbol} ${a})²`, normalize(answer), shuffle([
        normalize(answer),
        normalize(`x^2${signed(minus ? -a : a, "x")}${signed(a*a)}`),
        normalize(`x^2${signed(middle, "x")}${signed(-a*a)}`),
        normalize(`x^2${signed(a*a)}`)
      ]), `Dùng (u ${symbol} v)² = u² ${symbol} 2uv + v². Đáp án là ${normalize(answer)}.`);
    }
  },
  {
    title: "Biến đổi tổng hợp",
    tip: "Quan sát xem nên dùng hằng đẳng thức, phép nhân đa thức hay thu gọn trước.",
    generator: () => {
      const a = rand(1, 5), b = rand(1, 5);
      const x = 2*a-b;
      const constant = a*a+b;
      const answer = `x^2${signed(x, "x")}${signed(constant)}`;
      return textQuestion(`(x + ${a})² − ${b}(x − 1)`, normalize(answer),
        `Khai triển (x + ${a})² = x² + ${2*a}x + ${a*a}; rồi trừ ${b}x − ${b}. Kết quả: ${normalize(answer)}.`);
    }
  }
];

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

levels.forEach((level, index) => {
  const button = document.createElement("button");
  button.className = "level-item";
  button.innerHTML = `<span class="level-number">${index + 1}</span><span class="level-name">${level.title}</span>`;
  button.addEventListener("click", () => selectLevel(index));
  levelList.appendChild(button);
});

function selectLevel(index) {
  currentLevel = index;
  [...levelList.children].forEach((el, i) => el.classList.toggle("active", i === index));
  levelBadge.textContent = `Mức ${index + 1}`;
  levelTitle.textContent = levels[index].title;
  levelTip.textContent = levels[index].tip;
  newQuestion();
}

function newQuestion() {
  currentQuestion = levels[currentLevel].generator();
  questionSubmitted = false;
  expression.textContent = currentQuestion.expression;
  feedback.className = "feedback hidden";
  feedback.innerHTML = "";
  answerArea.innerHTML = "";

  if (currentQuestion.type === "text") {
    const input = document.createElement("input");
    input.className = "answer-input";
    input.id = "answerInput";
    input.placeholder = "Nhập đáp án, ví dụ: 8x - 2";
    input.autocomplete = "off";
    input.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(); });
    answerArea.appendChild(input);
    setTimeout(() => input.focus(), 30);
  } else {
    currentQuestion.choices.forEach((choice, i) => {
      const label = document.createElement("label");
      label.className = "choice";
      label.innerHTML = `<input type="radio" name="choice" value="${escapeHtml(choice)}"><span>${String.fromCharCode(65+i)}. ${pretty(choice)}</span>`;
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

  const isCorrect = equivalent(userAnswer, currentQuestion.answer);

  // Mỗi câu chỉ được ghi nhận một lần, tránh bấm Nộp bài nhiều lần làm sai thống kê.
  if (!questionSubmitted) {
    questionSubmitted = true;
    totalCount++;
    if (isCorrect) correctCount++;
    updateScore();
    await recordCloudProgress(isCorrect);
  }

  showFeedback(isCorrect,
    isCorrect ? "Chính xác." : `Chưa đúng. Đáp án đúng là ${pretty(currentQuestion.answer)}.`,
    true
  );
}

function showFeedback(isCorrect, message, withExplanation) {
  feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedback.innerHTML = `<strong>${message}</strong>${withExplanation ? `<span>${currentQuestion.explanation}</span>` : ""}`;
}

function updateScore() {
  document.getElementById("sessionScore").textContent = `${correctCount} đúng / ${totalCount} câu`;
  const percent = totalCount ? Math.round(correctCount / totalCount * 100) : 0;
  document.getElementById("progressBar").style.width = `${percent}%`;
}

function textQuestion(expression, answer, explanation) {
  return { type: "text", expression, answer, explanation };
}
function choiceQuestion(expression, answer, choices, explanation) {
  return { type: "choice", expression, answer, choices: [...new Set(choices)], explanation };
}

function equivalent(a, b) {
  return canonical(a) === canonical(b);
}
function canonical(value) {
  return value
    .toLowerCase()
    .replaceAll("²", "^2")
    .replaceAll("−", "-")
    .replace(/\s+/g, "")
    .replace(/\+\-/g, "-")
    .replace(/\-\-/g, "+")
    .replace(/^\+/, "")
    .replace(/\^1(?!\d)/g, "");
}
function normalize(value) {
  return value
    .replace(/\+\-/g, "-")
    .replace(/\-\-/g, "+")
    .replace(/^0x\+?/, "")
    .replace(/^1x/, "x")
    .replace(/^-1x/, "-x")
    .replace(/\+0$/, "")
    .replace(/-0$/, "")
    .replace(/\^2/g, "²");
}
function pretty(value) { return normalize(value).replace(/-/g, "−"); }
function signed(n, variable = "") {
  if (n === 0) return "";
  return n > 0 ? `+${n}${variable}` : `${n}${variable}`;
}
function formatTerm(n, variable) {
  if (n === 0) return "0";
  if (n === 1) return variable;
  if (n === -1) return `-${variable}`;
  return `${n}${variable}`;
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
function escapeHtml(text) {
  return text.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}


async function recordCloudProgress(isCorrect) {
  try {
    await saveAttempt({ grade: 8, topicId: "lop8-chude1", level: currentLevel + 1, skillId: `level-${currentLevel + 1}`, isCorrect });
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
    const { today, summary } = await loadTopic("lop8-chude1", 7);
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

document.getElementById("submitBtn").addEventListener("click", submitAnswer);
document.getElementById("newQuestionBtn").addEventListener("click", newQuestion);
document.getElementById("showAnswerBtn").addEventListener("click", () => {
  showFeedback(false, `Đáp án: ${pretty(currentQuestion.answer)}.`, true);
});
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("toan-theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("toan-theme") === "dark" || localStorage.getItem("schema-theme") === "dark") document.body.classList.add("dark");

await renderStoredProgress();
selectLevel(0);
