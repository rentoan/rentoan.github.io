/**
 * RenToan v1.4 - Question Generator
 * Chủ đề 2: Phân tích đa thức thành nhân tử
 *
 * Chuẩn đầu ra dùng chung cho:
 * - Luyện trực tuyến
 * - Xem trước đề
 * - Sinh đề PDF
 * - Sinh đáp án PDF
 */

export const topicInfo = Object.freeze({
  grade: 8,
  topicId: 'chu-de-2',
  topicName: 'Phân tích đa thức thành nhân tử',
  version: '1.4.0',
  levels: [
    { id: 1, name: 'Đặt nhân tử chung là một số' },
    { id: 2, name: 'Đặt nhân tử chung là đơn thức' },
    { id: 3, name: 'Đặt nhân tử chung và xử lí dấu' },
    { id: 4, name: 'Dùng hằng đẳng thức' },
    { id: 5, name: 'Nhóm các hạng tử' },
    { id: 6, name: 'Phối hợp nhiều phương pháp' },
    { id: 7, name: 'Phân tích tổng hợp' }
  ],
  supportedTypes: ['mcq', 'short-answer']
});

const VARS = ['x', 'y', 'a', 'b'];

function randomInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(array, rng = Math.random) {
  return array[randomInt(0, array.length - 1, rng)];
}

function nonZeroInt(min, max, rng = Math.random) {
  let value = 0;
  while (value === 0) value = randomInt(min, max, rng);
  return value;
}

function shuffle(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i, rng);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalizeSpaces(text) {
  return String(text)
    .replace(/\+\s*-/g, '- ')
    .replace(/-\s*-/g, '+ ')
    .replace(/\s+/g, ' ')
    .trim();
}

function signed(value) {
  if (value > 0) return `+ ${value}`;
  if (value < 0) return `- ${Math.abs(value)}`;
  return '';
}

function coefVar(coef, variable, power = 1, first = false) {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const variablePart = power === 0 ? '' : power === 1 ? variable : `${variable}${power === 2 ? '²' : `^${power}`}`;
  const numberPart = power > 0 && abs === 1 ? '' : String(abs);
  const core = `${numberPart}${variablePart}`;
  if (first) return coef < 0 ? `-${core}` : core;
  return coef < 0 ? `- ${core}` : `+ ${core}`;
}

function monomial(coef, variable = '', power = 0) {
  if (!variable || power === 0) return String(coef);
  const abs = Math.abs(coef);
  const sign = coef < 0 ? '-' : '';
  const number = abs === 1 ? '' : abs;
  const vp = power === 1 ? variable : `${variable}²`;
  return `${sign}${number}${vp}`;
}

function binomial(a, b, variable = 'x') {
  return normalizeSpaces(`${coefVar(a, variable, 1, true)} ${signed(b)}`);
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const normalized = normalizeSpaces(value);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
}

function makeChoices(correct, distractors, rng = Math.random) {
  let pool = uniqueStrings([correct, ...distractors]);
  let guard = 1;
  while (pool.length < 4 && guard <= 20) {
    pool.push(`${correct} + ${guard}`);
    pool = uniqueStrings(pool);
    guard += 1;
  }
  const shuffled = shuffle(pool.slice(0, 4), rng);
  return { choices: shuffled, correctIndex: shuffled.indexOf(normalizeSpaces(correct)) };
}

function makeQuestion({ level, type, prompt, answer, explanation, distractors = [], answerLines = 4, tags = [], rng = Math.random }) {
  const base = {
    id: `CD2-L${level}-${Date.now()}-${randomInt(1000, 9999, rng)}`,
    grade: 8,
    topicId: topicInfo.topicId,
    topicName: topicInfo.topicName,
    level,
    levelName: topicInfo.levels.find((item) => item.id === level)?.name || '',
    type,
    question: normalizeSpaces(prompt),
    answer: normalizeSpaces(answer),
    explanation: (Array.isArray(explanation) ? explanation : [explanation]).map(normalizeSpaces),
    answerLines,
    tags,
    difficulty: level <= 2 ? 1 : level <= 5 ? 2 : 3
  };
  if (type === 'mcq') {
    const { choices, correctIndex } = makeChoices(base.answer, distractors, rng);
    return { ...base, choices, correctIndex };
  }
  return { ...base, choices: null, correctIndex: null };
}

function generateLevel1(type, rng) {
  const v = pick(VARS, rng);
  const k = randomInt(2, 9, rng);
  const a = randomInt(2, 9, rng);
  const b = nonZeroInt(-9, 9, rng);
  const expression = normalizeSpaces(`${coefVar(k * a, v, 1, true)} ${signed(k * b)}`);
  const inside = binomial(a, b, v);
  const answer = `${k}(${inside})`;
  return makeQuestion({
    level: 1, type,
    prompt: `Phân tích đa thức thành nhân tử: ${expression}.`,
    answer,
    distractors: [`${a}(${binomial(k, b, v)})`, `${k * a}(${binomial(1, b, v)})`, `${k}(${binomial(a, -b, v)})`, `${k * a}${v}(${b})`],
    explanation: [`Hai hạng tử đều chia hết cho ${k}.`, `Đặt ${k} ra ngoài ngoặc.`, `Ta được ${expression} = ${answer}.`],
    answerLines: 3,
    tags: ['nhân tử chung', 'hệ số'], rng
  });
}

function generateLevel2(type, rng) {
  const v = pick(VARS, rng);
  const k = randomInt(2, 8, rng);
  const a = randomInt(2, 7, rng);
  const b = nonZeroInt(-8, 8, rng);
  const expression = normalizeSpaces(`${coefVar(k * a, v, 2, true)} ${coefVar(k * b, v, 1, false)}`);
  const inside = binomial(a, b, v);
  const answer = `${k}${v}(${inside})`;
  return makeQuestion({
    level: 2, type,
    prompt: `Phân tích đa thức thành nhân tử: ${expression}.`,
    answer,
    distractors: [`${k}(${coefVar(a, v, 2, true)} ${coefVar(b, v, 1, false)})`, `${v}(${binomial(k * a, k * b, v)})`, `${k}${v}(${binomial(a, -b, v)})`, `${k}${v}²(${binomial(a, b, v)})`],
    explanation: [`Hai hạng tử có nhân tử chung lớn nhất là ${k}${v}.`, `Chia từng hạng tử cho ${k}${v}, ta được ${inside}.`, `Vậy kết quả là ${answer}.`],
    answerLines: 4,
    tags: ['nhân tử chung', 'đơn thức'], rng
  });
}

function generateLevel3(type, rng) {
  const v = pick(VARS, rng);
  const k = randomInt(2, 7, rng);
  const a = randomInt(2, 7, rng);
  const b = randomInt(1, 8, rng);
  const expression = normalizeSpaces(`${coefVar(-k * a, v, 2, true)} ${coefVar(k * b, v, 1, false)}`);
  const inside = binomial(a, -b, v);
  const answer = `-${k}${v}(${inside})`;
  return makeQuestion({
    level: 3, type,
    prompt: `Phân tích đa thức thành nhân tử, ưu tiên để hạng tử đầu trong ngoặc dương: ${expression}.`,
    answer,
    distractors: [`${k}${v}(${binomial(-a, b, v)})`, `-${k}${v}(${binomial(a, b, v)})`, `-${k}(${coefVar(a, v, 2, true)} ${coefVar(-b, v, 1, false)})`, `${k}${v}(${binomial(a, -b, v)})`],
    explanation: [`Đặt nhân tử chung âm -${k}${v} để hạng tử đầu trong ngoặc dương.`, `Khi chia cho một số âm, dấu của mỗi hạng tử đổi lại.`, `Ta được ${answer}.`],
    answerLines: 4,
    tags: ['nhân tử chung âm', 'đổi dấu'], rng
  });
}

function generateLevel4(type, rng) {
  const v = pick(VARS, rng);
  const form = pick(['diff', 'plusSquare', 'minusSquare'], rng);
  const a = randomInt(1, 6, rng);
  const b = randomInt(1, 9, rng);
  let prompt; let answer; let distractors; let explanation;
  if (form === 'diff') {
    prompt = `Phân tích đa thức thành nhân tử: ${a * a}${v}² - ${b * b}.`;
    answer = `(${a}${v} - ${b})(${a}${v} + ${b})`;
    distractors = [`(${a}${v} - ${b})²`, `(${a}${v} + ${b})²`, `(${a * a}${v} - ${b})(${v} + ${b})`, `(${a}${v} - ${b})(${a}${v} - ${b})`];
    explanation = [`Nhận ra hiệu hai bình phương: A² - B² = (A - B)(A + B).`, `Ở đây A = ${a}${v}, B = ${b}.`, `Kết quả là ${answer}.`];
  } else {
    const sign = form === 'plusSquare' ? '+' : '-';
    const mid = 2 * a * b;
    prompt = `Phân tích đa thức thành nhân tử: ${a * a}${v}² ${sign} ${mid}${v} + ${b * b}.`;
    answer = `(${a}${v} ${sign} ${b})²`;
    distractors = [`(${a}${v} ${sign === '+' ? '-' : '+'} ${b})²`, `(${a}${v} ${sign} ${b})(${a}${v} ${sign === '+' ? '-' : '+'} ${b})`, `(${a * a}${v} ${sign} ${b})²`, `(${a}${v} ${sign} ${b * b})²`];
    explanation = [`Đa thức có dạng A² ${sign} 2AB + B².`, `Với A = ${a}${v}, B = ${b}.`, `Do đó đa thức bằng ${answer}.`];
  }
  return makeQuestion({ level: 4, type, prompt, answer, distractors, explanation, answerLines: 5, tags: ['hằng đẳng thức'], rng });
}

function generateLevel5(type, rng) {
  const v = pick(VARS, rng);
  const a = randomInt(2, 7, rng);
  const b = nonZeroInt(-7, 7, rng);
  const c = randomInt(2, 7, rng);
  const d = nonZeroInt(-7, 7, rng);
  // ax(a v+b) + c(a v+b)
  const x2 = a;
  const x1 = b + a * c;
  const constant = b * c;
  const expression = normalizeSpaces(`${coefVar(x2, v, 2, true)} ${coefVar(x1, v, 1, false)} ${coefVar(constant, v, 0, false)}`);
  const answer = `(${binomial(a, b, v)})(${binomial(1, c, v)})`;
  return makeQuestion({
    level: 5, type,
    prompt: `Phân tích đa thức thành nhân tử bằng phương pháp nhóm: ${expression}.`,
    answer,
    distractors: [`(${binomial(a, -b, v)})(${binomial(1, c, v)})`, `(${binomial(a, b, v)})(${binomial(1, -c, v)})`, `(${binomial(a, c, v)})(${binomial(1, b, v)})`, `${v}(${expression})`],
    explanation: [`Tách hạng tử giữa: ${x1}${v} = ${b}${v} + ${a * c}${v}.`, `Nhóm thành ${v}(${binomial(a, b, v)}) + ${c}(${binomial(a, b, v)}).`, `Đặt nhân tử chung ${binomial(a, b, v)}, ta được ${answer}.`],
    answerLines: 6,
    tags: ['nhóm hạng tử'], rng
  });
}

function generateLevel6(type, rng) {
  const v = pick(VARS, rng);
  const k = randomInt(2, 7, rng);
  const a = randomInt(1, 5, rng);
  const b = randomInt(1, 8, rng);
  // k(a²v²-b²)
  const expression = `${k * a * a}${v}² - ${k * b * b}`;
  const answer = `${k}(${a}${v} - ${b})(${a}${v} + ${b})`;
  return makeQuestion({
    level: 6, type,
    prompt: `Phân tích hoàn toàn đa thức thành nhân tử: ${expression}.`,
    answer,
    distractors: [`${k}(${a}${v} - ${b})²`, `(${k * a}${v} - ${k * b})(${a}${v} + ${b})`, `${k}(${a * a}${v} - ${b * b})`, `${k}(${a}${v} + ${b})²`],
    explanation: [`Đặt nhân tử chung ${k}: ${expression} = ${k}(${a * a}${v}² - ${b * b}).`, `Trong ngoặc là hiệu hai bình phương.`, `Suy ra kết quả ${answer}.`],
    answerLines: 6,
    tags: ['phối hợp', 'nhân tử chung', 'hiệu hai bình phương'], rng
  });
}

function generateLevel7(type, rng) {
  const v = pick(VARS, rng);
  const k = randomInt(2, 6, rng);
  const a = randomInt(1, 4, rng);
  const b = randomInt(1, 7, rng);
  const c = randomInt(1, 6, rng);
  // k(av+b)^2 - kc^2 = k(av+b-c)(av+b+c)
  const mid = 2 * a * b;
  const constPart = b * b - c * c;
  const expression = normalizeSpaces(`${coefVar(k * a * a, v, 2, true)} ${coefVar(k * mid, v, 1, false)} ${coefVar(k * constPart, v, 0, false)}`);
  const leftConst = b - c;
  const rightConst = b + c;
  const answer = `${k}(${binomial(a, leftConst, v)})(${binomial(a, rightConst, v)})`;
  return makeQuestion({
    level: 7, type,
    prompt: `Phân tích hoàn toàn đa thức thành nhân tử: ${expression}.`,
    answer,
    distractors: [`${k}(${binomial(a, b, v)})²`, `${k}(${binomial(a, -c, v)})(${binomial(a, c, v)})`, `(${binomial(k * a, k * leftConst, v)})(${binomial(a, rightConst, v)})`, `${k}(${binomial(a, rightConst, v)})²`],
    explanation: [`Đặt ${k} ra ngoài ngoặc.`, `Ba hạng tử đầu tạo thành bình phương (${a}${v} + ${b})², nên biểu thức trong ngoặc là (${a}${v} + ${b})² - ${c}².`, `Dùng hiệu hai bình phương, ta được ${answer}.`],
    answerLines: 8,
    tags: ['tổng hợp', 'bình phương hoàn chỉnh', 'hiệu hai bình phương'], rng
  });
}

const LEVEL_GENERATORS = { 1: generateLevel1, 2: generateLevel2, 3: generateLevel3, 4: generateLevel4, 5: generateLevel5, 6: generateLevel6, 7: generateLevel7 };

export function generateQuestion({ level = 1, type = 'mcq', rng = Math.random } = {}) {
  const numericLevel = Number(level);
  if (!LEVEL_GENERATORS[numericLevel]) throw new RangeError(`Mức luyện không hợp lệ: ${level}. Chỉ nhận từ 1 đến 7.`);
  if (!topicInfo.supportedTypes.includes(type)) throw new TypeError(`Loại câu hỏi không hợp lệ: ${type}.`);
  if (typeof rng !== 'function') throw new TypeError('rng phải là một hàm trả về số trong khoảng [0, 1).');
  return LEVEL_GENERATORS[numericLevel](type, rng);
}

export function generateQuestions({ level = 1, type = 'mcq', count = 1, rng = Math.random } = {}) {
  const total = Math.max(1, Math.min(100, Number(count) || 1));
  const result = [];
  const seen = new Set();
  let attempts = 0;
  while (result.length < total && attempts < total * 50) {
    const question = generateQuestion({ level, type, rng });
    if (!seen.has(question.question)) {
      seen.add(question.question);
      result.push(question);
    }
    attempts += 1;
  }
  if (result.length < total) throw new Error(`Chỉ sinh được ${result.length}/${total} câu không trùng nhau.`);
  return result;
}

export default { topicInfo, generateQuestion, generateQuestions };
