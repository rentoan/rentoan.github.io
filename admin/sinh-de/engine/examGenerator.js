import { createSeed } from './random.js';

function positiveInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function normalizeExamNumber(value) {
  const text = String(value ?? '').trim();
  return text || '1';
}

export function formatExamNumber(value) {
  const text = normalizeExamNumber(value);
  return /^\d+$/.test(text) ? text.padStart(3, '0') : text.replace(/[^a-zA-Z0-9_-]+/g, '-');
}

export function validateBlueprint(blueprint) {
  const errors = [];
  if (!Array.isArray(blueprint) || blueprint.length === 0) errors.push('Ma trận đề đang trống.');
  blueprint?.forEach((row, index) => {
    if (!row.topicId) errors.push(`Dòng ${index + 1}: thiếu chủ đề.`);
    if (!Number.isInteger(Number(row.level)) || Number(row.level) < 1) errors.push(`Dòng ${index + 1}: mức luyện không hợp lệ.`);
    if (!['mcq', 'short-answer'].includes(row.type)) errors.push(`Dòng ${index + 1}: loại câu không hợp lệ.`);
    if (positiveInt(row.count) < 1) errors.push(`Dòng ${index + 1}: số câu phải lớn hơn 0.`);
  });
  return { valid: errors.length === 0, errors };
}

export function buildExam(engine, options = {}) {
  const blueprint = (options.blueprint ?? []).filter((row) => positiveInt(row.count) > 0);
  const validation = validateBlueprint(blueprint);
  if (!validation.valid) throw new Error(validation.errors.join('\n'));

  const examNumber = normalizeExamNumber(options.examNumber);
  const seed = String(options.seed || createSeed(`DE-${examNumber}`));
  const questions = [];

  blueprint.forEach((row, rowIndex) => {
    const result = engine.generateMany({
      topicId: row.topicId,
      level: Number(row.level),
      type: row.type,
      count: positiveInt(row.count),
      seed: `${seed}:R${rowIndex + 1}`,
      uniqueQuestions: true
    });
    questions.push(...result.questions);
  });

  const mcq = questions.filter((q) => q.type === 'mcq');
  const shortAnswer = questions.filter((q) => q.type === 'short-answer');
  const orderedQuestions = [...mcq, ...shortAnswer].map((question, index) => ({
    ...question,
    number: index + 1
  }));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    grade: Number(options.grade || 8),
    subject: options.subject || 'Toán',
    examNumber,
    duration: positiveInt(options.duration, 45),
    title: options.title || `ĐỀ LUYỆN SỐ ${examNumber}`,
    schoolName: String(options.schoolName || '').trim(),
    teacherName: String(options.teacherName || '').trim(),
    seed,
    blueprint,
    questions: orderedQuestions,
    stats: {
      total: orderedQuestions.length,
      mcq: mcq.length,
      shortAnswer: shortAnswer.length
    }
  };
}
