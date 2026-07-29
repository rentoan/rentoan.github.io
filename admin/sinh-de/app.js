import { QuestionEngine } from './engine/questionEngine.js';
import { buildExam } from './engine/examGenerator.js';
import { mountPreview } from './engine/preview.js';
import { downloadAnswerPdf, downloadBothPdfs, downloadExamPdf } from './engine/pdfEngine.js';
import * as topic1 from './generators/chu-de-1.js';
import * as topic2 from './generators/chu-de-2.js';
import * as topic3 from './generators/chu-de-3.js';

const engine = new QuestionEngine();
engine.register(topic1).register(topic2).register(topic3);

const state = { exam: null, previewMode: 'exam' };
const $ = (selector) => document.querySelector(selector);
const matrixBody = $('#matrixBody');
const preview = $('#preview');
const status = $('#status');

function setStatus(message, kind = 'info') {
  status.textContent = message;
  status.dataset.kind = kind;
}

function createMatrix() {
  const topics = engine.listTopics({ grade: 8 });
  matrixBody.innerHTML = topics.map((topic) => `
    <section class="topic-matrix">
      <div class="topic-title"><strong>${topic.topicName}</strong><span>${topic.levels.length} mức luyện</span></div>
      <div class="matrix-grid matrix-head">
        <span>Mức</span><span>Trắc nghiệm</span><span>Tự luận</span>
      </div>
      ${topic.levels.map((level) => `
        <div class="matrix-grid" data-topic="${topic.topicId}" data-level="${level.id}">
          <label title="${level.name}">${level.id}. ${level.name}</label>
          <input class="count-input" type="number" min="0" max="30" value="0" data-type="mcq" aria-label="Số câu trắc nghiệm mức ${level.id}">
          <input class="count-input" type="number" min="0" max="30" value="0" data-type="short-answer" aria-label="Số câu tự luận mức ${level.id}">
        </div>`).join('')}
    </section>`).join('');

  // Cấu hình khởi đầu vừa đủ để bấm thử ngay.
  matrixBody.querySelector('[data-topic="chu-de-1"][data-level="1"] [data-type="mcq"]').value = 2;
  matrixBody.querySelector('[data-topic="chu-de-1"][data-level="2"] [data-type="short-answer"]').value = 1;
  matrixBody.querySelector('[data-topic="chu-de-2"][data-level="1"] [data-type="mcq"]').value = 2;
  matrixBody.querySelector('[data-topic="chu-de-2"][data-level="4"] [data-type="short-answer"]').value = 1;
}

function readBlueprint() {
  return [...matrixBody.querySelectorAll('.matrix-grid[data-topic]')].flatMap((row) => {
    const topicId = row.dataset.topic;
    const level = Number(row.dataset.level);
    return [...row.querySelectorAll('.count-input')]
      .map((input) => ({ topicId, level, type: input.dataset.type, count: Number(input.value || 0) }))
      .filter((item) => item.count > 0);
  });
}

function buildFromForm() {
  const blueprint = readBlueprint();
  if (!blueprint.length) throw new Error('Bạn hãy nhập ít nhất một câu trong ma trận đề.');
  return buildExam(engine, {
    grade: 8,
    subject: 'Toán',
    examNumber: $('#examNumber').value,
    duration: $('#duration').value,
    schoolName: $('#schoolName').value,
    teacherName: $('#teacherName').value,
    seed: $('#seed').value.trim(),
    blueprint
  });
}

function showExam(exam, mode = state.previewMode) {
  state.exam = exam;
  state.previewMode = mode;
  mountPreview(preview, exam, mode);
  $('#seed').value = exam.seed;
  $('#summary').textContent = `${exam.stats.total} câu: ${exam.stats.mcq} trắc nghiệm, ${exam.stats.shortAnswer} tự luận.`;
  document.querySelectorAll('[data-preview-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.previewMode === mode);
  });
  document.querySelectorAll('[data-requires-exam]').forEach((button) => { button.disabled = false; });
}

$('#generateBtn').addEventListener('click', () => {
  try {
    showExam(buildFromForm(), 'exam');
    setStatus('Đã sinh đề. Bạn có thể xem đáp án hoặc tải PDF.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(error.message, 'error');
  }
});

$('#regenerateBtn').addEventListener('click', () => {
  $('#seed').value = '';
  $('#generateBtn').click();
});

document.querySelectorAll('[data-preview-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!state.exam) return;
    showExam(state.exam, button.dataset.previewMode);
  });
});

async function runPdf(action) {
  if (!state.exam) return;
  try {
    document.body.classList.add('busy');
    setStatus('Đang dựng PDF, vui lòng chờ...', 'info');
    await action(state.exam);
    setStatus('Đã tạo tệp PDF.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(error.message, 'error');
  } finally {
    document.body.classList.remove('busy');
  }
}

$('#downloadExamBtn').addEventListener('click', () => runPdf(downloadExamPdf));
$('#downloadAnswerBtn').addEventListener('click', () => runPdf(downloadAnswerPdf));
$('#downloadBothBtn').addEventListener('click', () => runPdf((exam) => downloadBothPdfs(exam, (message) => setStatus(message))));

$('#resetBtn').addEventListener('click', () => {
  document.querySelectorAll('.count-input').forEach((input) => { input.value = 0; });
  state.exam = null;
  preview.innerHTML = '<div class="empty-preview">Nhập số câu rồi bấm <strong>Sinh đề</strong>.</div>';
  $('#summary').textContent = 'Chưa có đề.';
  $('#seed').value = '';
  document.querySelectorAll('[data-requires-exam]').forEach((button) => { button.disabled = true; });
  setStatus('Đã xóa cấu hình.', 'info');
});

createMatrix();
setStatus('Sẵn sàng sinh đề luyện tập.', 'info');
