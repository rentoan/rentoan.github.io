import { createSeed, createSeededRandom, pick } from './random.js';
import {
  assert,
  cloneQuestion,
  deepFreeze,
  makeQuestionKey,
  normalizeText,
  unique
} from './utils.js';

export const QUESTION_TYPES = deepFreeze(['mcq', 'short-answer']);

export class QuestionValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'QuestionValidationError';
    this.details = details;
  }
}

function validateTopicInfo(topicInfo) {
  assert(topicInfo && typeof topicInfo === 'object', 'Generator phải xuất topicInfo.');
  assert(Number.isInteger(topicInfo.grade), 'topicInfo.grade phải là số nguyên.');
  assert(normalizeText(topicInfo.topicId), 'topicInfo.topicId không được để trống.');
  assert(normalizeText(topicInfo.topicName), 'topicInfo.topicName không được để trống.');
  assert(Array.isArray(topicInfo.levels) && topicInfo.levels.length > 0, 'topicInfo.levels phải là mảng không rỗng.');
  const levelIds = topicInfo.levels.map((item) => item.id);
  assert(levelIds.every(Number.isInteger), 'Mỗi level.id phải là số nguyên.');
  assert(unique(levelIds).length === levelIds.length, 'Các level.id không được trùng nhau.');
}

export function validateQuestion(question, topicInfo = null) {
  const errors = [];
  if (!question || typeof question !== 'object') errors.push('Câu hỏi phải là object.');
  if (errors.length) return { valid: false, errors };

  const requiredText = ['id', 'topicId', 'topicName', 'question', 'answer'];
  requiredText.forEach((field) => {
    if (!normalizeText(question[field])) errors.push(`${field} không được để trống.`);
  });

  if (!Number.isInteger(question.grade)) errors.push('grade phải là số nguyên.');
  if (!Number.isInteger(question.level)) errors.push('level phải là số nguyên.');
  if (!QUESTION_TYPES.includes(question.type)) errors.push(`type phải là một trong: ${QUESTION_TYPES.join(', ')}.`);
  if (!Array.isArray(question.explanation) || question.explanation.length === 0) {
    errors.push('explanation phải là mảng không rỗng.');
  }
  if (!Number.isInteger(question.answerLines) || question.answerLines < 0) {
    errors.push('answerLines phải là số nguyên không âm.');
  }

  if (question.type === 'mcq') {
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      errors.push('Câu trắc nghiệm phải có ít nhất 2 lựa chọn.');
    } else {
      const normalizedChoices = question.choices.map(normalizeText);
      if (unique(normalizedChoices).length !== normalizedChoices.length) errors.push('Các lựa chọn không được trùng nhau.');
      if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
        errors.push('correctIndex không hợp lệ.');
      } else if (normalizeText(question.choices[question.correctIndex]) !== normalizeText(question.answer)) {
        errors.push('Lựa chọn đúng không khớp với answer.');
      }
    }
  }

  if (question.type === 'short-answer') {
    if (question.choices !== null && question.choices !== undefined) errors.push('Câu tự luận không nên có choices.');
    if (question.correctIndex !== null && question.correctIndex !== undefined) errors.push('Câu tự luận không nên có correctIndex.');
  }

  if (topicInfo) {
    if (question.grade !== topicInfo.grade) errors.push('grade của câu hỏi không khớp topicInfo.');
    if (question.topicId !== topicInfo.topicId) errors.push('topicId của câu hỏi không khớp topicInfo.');
    if (!topicInfo.levels.some((item) => item.id === question.level)) errors.push('level không tồn tại trong topicInfo.');
  }

  return { valid: errors.length === 0, errors };
}

function normalizeQuestion(question, topicInfo) {
  const result = cloneQuestion(question);
  result.id = normalizeText(result.id);
  result.topicId = normalizeText(result.topicId);
  result.topicName = normalizeText(result.topicName);
  result.levelName = normalizeText(result.levelName);
  result.question = normalizeText(result.question);
  result.answer = normalizeText(result.answer);
  result.explanation = (Array.isArray(result.explanation) ? result.explanation : [result.explanation])
    .map(normalizeText)
    .filter(Boolean);
  result.tags = Array.isArray(result.tags) ? unique(result.tags.map(normalizeText).filter(Boolean)) : [];
  if (Array.isArray(result.choices)) result.choices = result.choices.map(normalizeText);
  if (!result.levelName) {
    result.levelName = topicInfo.levels.find((item) => item.id === result.level)?.name ?? '';
  }
  return result;
}

/**
 * Registry trung tâm cho các generator theo chủ đề.
 * Generator module cần xuất: topicInfo và generateQuestion(options).
 */
export class QuestionEngine {
  constructor({ strict = true } = {}) {
    this.strict = Boolean(strict);
    this.registry = new Map();
  }

  register(generatorModule) {
    const { topicInfo, generateQuestion } = generatorModule ?? {};
    validateTopicInfo(topicInfo);
    assert(typeof generateQuestion === 'function', 'Generator phải xuất hàm generateQuestion(options).');
    if (this.registry.has(topicInfo.topicId)) {
      throw new Error(`Chủ đề ${topicInfo.topicId} đã được đăng ký.`);
    }
    this.registry.set(topicInfo.topicId, { topicInfo: deepFreeze(cloneQuestion(topicInfo)), generateQuestion });
    return this;
  }

  unregister(topicId) {
    return this.registry.delete(topicId);
  }

  has(topicId) {
    return this.registry.has(topicId);
  }

  listTopics({ grade = null } = {}) {
    return [...this.registry.values()]
      .map(({ topicInfo }) => cloneQuestion(topicInfo))
      .filter((item) => grade === null || item.grade === grade)
      .sort((a, b) => a.grade - b.grade || a.topicId.localeCompare(b.topicId, 'vi'));
  }

  getTopic(topicId) {
    const entry = this.registry.get(topicId);
    return entry ? cloneQuestion(entry.topicInfo) : null;
  }

  generate({ topicId, level = null, type = null, seed = null } = {}) {
    const entry = this.registry.get(topicId);
    if (!entry) throw new Error(`Chưa đăng ký generator cho chủ đề: ${topicId}.`);

    const { topicInfo, generateQuestion } = entry;
    const actualSeed = seed ?? createSeed(topicId.toUpperCase());
    const rng = createSeededRandom(actualSeed);
    const supportedTypes = topicInfo.supportedTypes?.length ? topicInfo.supportedTypes : QUESTION_TYPES;
    const actualLevel = level ?? pick(topicInfo.levels, rng).id;
    const actualType = type ?? pick(supportedTypes, rng);

    if (!topicInfo.levels.some((item) => item.id === actualLevel)) {
      throw new RangeError(`Level ${actualLevel} không tồn tại trong ${topicId}.`);
    }
    if (!supportedTypes.includes(actualType)) {
      throw new RangeError(`Kiểu ${actualType} không được hỗ trợ trong ${topicId}.`);
    }

    const raw = generateQuestion({ level: actualLevel, type: actualType, rng });
    const question = normalizeQuestion(raw, topicInfo);
    question.seed = String(actualSeed);

    const validation = validateQuestion(question, topicInfo);
    if (!validation.valid && this.strict) {
      throw new QuestionValidationError(`Câu hỏi không hợp lệ: ${validation.errors.join(' ')}`, {
        topicId,
        level: actualLevel,
        type: actualType,
        question
      });
    }
    question.validation = validation;
    return question;
  }

  generateMany({ topicId, level = null, type = null, count = 1, seed = null, uniqueQuestions = true, maxAttempts = null } = {}) {
    if (!Number.isInteger(count) || count < 1) throw new RangeError('count phải là số nguyên dương.');
    const rootSeed = seed ?? createSeed('DE');
    const results = [];
    const seen = new Set();
    const limit = maxAttempts ?? Math.max(30, count * 20);

    for (let attempt = 0; attempt < limit && results.length < count; attempt += 1) {
      const question = this.generate({ topicId, level, type, seed: `${rootSeed}:${attempt}` });
      const key = makeQuestionKey(question);
      if (!uniqueQuestions || !seen.has(key)) {
        seen.add(key);
        results.push(question);
      }
    }

    if (results.length < count) {
      throw new Error(`Chỉ sinh được ${results.length}/${count} câu khác nhau sau ${limit} lần thử.`);
    }
    return { seed: String(rootSeed), questions: results };
  }
}

export const questionEngine = new QuestionEngine();
