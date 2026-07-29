/** RenToan v1.4.0 - Các hàm dùng chung cho Question Engine. */

export function normalizeText(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

export function clampInteger(value, min, max, fallback = min) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function unique(values) {
  return [...new Set(values)];
}

export function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

export function cloneQuestion(question) {
  if (typeof structuredClone === 'function') return structuredClone(question);
  return JSON.parse(JSON.stringify(question));
}

export function makeQuestionKey(question) {
  return [
    question.topicId,
    question.level,
    question.type,
    normalizeText(question.question),
    normalizeText(question.answer)
  ].join('|');
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function slugify(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
