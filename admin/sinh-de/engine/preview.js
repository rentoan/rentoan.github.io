const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderHeader(exam, answerMode = false) {
  return `
    <header class="paper-header">
      <div class="paper-brand">${escapeHtml(exam.schoolName || 'RENTOAN')}</div>
      <h1>${answerMode ? `ĐÁP ÁN ${escapeHtml(exam.title)}` : escapeHtml(exam.title)}</h1>
      <p>Môn: ${escapeHtml(exam.subject)} ${escapeHtml(exam.grade)} · Thời gian: ${exam.duration} phút</p>
      ${answerMode ? `<p class="seed-line">Mã tái tạo: ${escapeHtml(exam.seed)}</p>` : `
      <div class="student-fields">
        <span>Họ và tên: ............................................................</span>
        <span>Lớp: ....................</span>
      </div>`}
    </header>`;
}

function renderChoices(question, answerMode = false) {
  if (!question.choices) return '';
  return `<div class="choices">${question.choices.map((choice, index) => {
    const correct = answerMode && index === question.correctIndex ? ' correct-choice' : '';
    return `<div class="choice${correct}"><strong>${LETTERS[index]}.</strong> ${escapeHtml(choice)}</div>`;
  }).join('')}</div>`;
}

function renderAnswerLines(question) {
  const count = Math.max(2, Number(question.answerLines || 3));
  return `<div class="answer-lines">${Array.from({ length: count }, () => '<div></div>').join('')}</div>`;
}

export function renderExamHtml(exam) {
  const mcq = exam.questions.filter((q) => q.type === 'mcq');
  const written = exam.questions.filter((q) => q.type === 'short-answer');
  return `
    <article class="paper exam-paper">
      ${renderHeader(exam)}
      ${mcq.length ? `<section><h2>Phần I. Trắc nghiệm</h2>${mcq.map((q) => `
        <div class="question-block">
          <p><strong>Câu ${q.number}.</strong> ${escapeHtml(q.question)}</p>
          ${renderChoices(q)}
        </div>`).join('')}</section>` : ''}
      ${written.length ? `<section><h2>Phần II. Tự luận</h2>${written.map((q) => `
        <div class="question-block written-question">
          <p><strong>Câu ${q.number}.</strong> ${escapeHtml(q.question)}</p>
          ${renderAnswerLines(q)}
        </div>`).join('')}</section>` : ''}
      <footer class="paper-footer">Chúc em làm bài cẩn thận và tự tin.</footer>
    </article>`;
}

export function renderAnswerHtml(exam) {
  return `
    <article class="paper answer-paper">
      ${renderHeader(exam, true)}
      <section>${exam.questions.map((q) => `
        <div class="answer-block">
          <p><strong>Câu ${q.number}.</strong> ${escapeHtml(q.question)}</p>
          ${renderChoices(q, true)}
          <p class="answer-value"><strong>Đáp án:</strong> ${escapeHtml(q.answer)}</p>
          <div class="explanation"><strong>Giải thích ngắn:</strong>
            <ol>${(q.explanation || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
          </div>
        </div>`).join('')}</section>
    </article>`;
}

export function mountPreview(container, exam, mode = 'exam') {
  if (!container) throw new Error('Không tìm thấy vùng xem trước.');
  container.innerHTML = mode === 'answer' ? renderAnswerHtml(exam) : renderExamHtml(exam);
}
