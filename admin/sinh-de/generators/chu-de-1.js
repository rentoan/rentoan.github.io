/**
 * RenToan v1.4 - Question Generator
 * Chủ đề 1: Biến đổi biểu thức đại số
 *
 * Chuẩn đầu ra dùng chung cho:
 * - Luyện trực tuyến
 * - Xem trước đề
 * - Sinh đề PDF
 * - Sinh đáp án PDF
 *
 * Cách dùng:
 *   import { topicInfo, generateQuestion } from './generator.js';
 *   const q = generateQuestion({ level: 2, type: 'mcq' });
 */

export const topicInfo = Object.freeze({
  grade: 8,
  topicId: 'chu-de-1',
  topicName: 'Biến đổi biểu thức đại số',
  version: '1.4.0',
  levels: [
    { id: 1, name: 'Thu gọn các hạng tử đồng dạng' },
    { id: 2, name: 'Bỏ ngoặc và đổi dấu' },
    { id: 3, name: 'Sử dụng tính chất phân phối' },
    { id: 4, name: 'Thu gọn biểu thức nhiều bước' },
    { id: 5, name: 'Nhân đa thức' },
    { id: 6, name: 'Hằng đẳng thức đáng nhớ' },
    { id: 7, name: 'Biến đổi tổng hợp' }
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

function signedNumber(value) {
  if (value > 0) return `+ ${value}`;
  if (value < 0) return `- ${Math.abs(value)}`;
  return '';
}

function coefficientTerm(coef, variable = 'x', power = 1, isFirst = false) {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const variablePart = power === 0 ? '' : power === 1 ? variable : `${variable}²`;
  const numberPart = power > 0 && abs === 1 ? '' : String(abs);
  const core = `${numberPart}${variablePart}` || '0';

  if (isFirst) return coef < 0 ? `-${core}` : core;
  return coef < 0 ? `- ${core}` : `+ ${core}`;
}

function polynomialToText(coefficients, variable = 'x') {
  const terms = [];
  for (let power = coefficients.length - 1; power >= 0; power -= 1) {
    const coef = coefficients[power] || 0;
    if (coef === 0) continue;
    terms.push(coefficientTerm(coef, variable, power, terms.length === 0));
  }
  return terms.length ? terms.join(' ') : '0';
}

function linearToText(a, b, variable = 'x') {
  return polynomialToText([b, a], variable);
}

function quadraticToText(a, b, c, variable = 'x') {
  return polynomialToText([c, b, a], variable);
}

function uniqueStrings(values) {
  const result = [];
  const seen = new Set();
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
    // Phương án dự phòng vẫn là một biểu thức hợp lệ và chắc chắn khác đáp án đúng.
    pool.push(`(${normalizeSpaces(correct)}) + ${guard}`);
    pool = uniqueStrings(pool);
    guard += 1;
  }
  pool = pool.slice(0, 4);
  const shuffled = shuffle(pool, rng);
  return {
    choices: shuffled,
    correctIndex: shuffled.indexOf(normalizeSpaces(correct))
  };
}

function makeQuestion({
  level,
  type,
  prompt,
  answer,
  explanation,
  distractors = [],
  answerLines = 3,
  tags = [],
  rng = Math.random
}) {
  const base = {
    id: `CD1-L${level}-${Date.now()}-${randomInt(1000, 9999, rng)}`,
    grade: 8,
    topicId: topicInfo.topicId,
    topicName: topicInfo.topicName,
    level,
    levelName: topicInfo.levels.find((item) => item.id === level)?.name || '',
    type,
    question: normalizeSpaces(prompt),
    answer: normalizeSpaces(answer),
    explanation: Array.isArray(explanation)
      ? explanation.map(normalizeSpaces)
      : [normalizeSpaces(explanation)],
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
  const variable = pick(VARS, rng);
  const a = nonZeroInt(-9, 9, rng);
  const b = nonZeroInt(-9, 9, rng);
  const c = randomInt(-12, 12, rng);
  const sum = a + b;

  const expression = `${coefficientTerm(a, variable, 1, true)} ${coefficientTerm(b, variable, 1, false)} ${coefficientTerm(c, variable, 0, false)}`;
  const answer = linearToText(sum, c, variable);
  const distractors = [
    linearToText(a - b, c, variable),
    linearToText(sum, -c, variable),
    linearToText(a * b, c, variable),
    linearToText(sum + c, 0, variable)
  ];

  return makeQuestion({
    level: 1,
    type,
    prompt: `Thu gọn biểu thức: ${expression}.`,
    answer,
    distractors,
    explanation: [
      `${coefficientTerm(a, variable, 1, true)} và ${coefficientTerm(b, variable, 1, true)} là hai hạng tử đồng dạng.`,
      `Cộng các hệ số: ${a} + (${b}) = ${sum}.`,
      `Giữ nguyên hạng tử tự do ${c}. Kết quả là ${answer}.`
    ],
    answerLines: 2,
    tags: ['hạng tử đồng dạng', 'thu gọn'] ,
    rng
  });
}

function generateLevel2(type, rng) {
  const variable = pick(VARS, rng);
  const a = nonZeroInt(-8, 8, rng);
  const b = nonZeroInt(-8, 8, rng);
  const c = nonZeroInt(-9, 9, rng);
  const outer = pick([1, -1], rng);

  const inside = `${coefficientTerm(b, variable, 1, true)} ${coefficientTerm(c, variable, 0, false)}`;
  const operator = outer === 1 ? '+' : '-';
  const expression = `${coefficientTerm(a, variable, 1, true)} ${operator} (${inside})`;
  const resultA = a + outer * b;
  const resultB = outer * c;
  const answer = linearToText(resultA, resultB, variable);

  return makeQuestion({
    level: 2,
    type,
    prompt: `Bỏ ngoặc rồi thu gọn: ${expression}.`,
    answer,
    distractors: [
      linearToText(a + b, c, variable),
      linearToText(a - b, c, variable),
      linearToText(resultA, -resultB, variable),
      linearToText(a + outer * c, outer * b, variable)
    ],
    explanation: outer === -1
      ? [
          `Dấu trừ trước ngoặc làm đổi dấu tất cả các hạng tử trong ngoặc.`,
          `Ta được ${coefficientTerm(a, variable, 1, true)} ${coefficientTerm(-b, variable, 1, false)} ${coefficientTerm(-c, variable, 0, false)}.`,
          `Thu gọn các hạng tử đồng dạng, kết quả là ${answer}.`
        ]
      : [
          `Dấu cộng trước ngoặc không làm thay đổi dấu các hạng tử trong ngoặc.`,
          `Bỏ ngoặc rồi thu gọn các hạng tử đồng dạng.`,
          `Kết quả là ${answer}.`
        ],
    answerLines: 3,
    tags: ['bỏ ngoặc', 'đổi dấu'],
    rng
  });
}

function generateLevel3(type, rng) {
  const variable = pick(VARS, rng);
  const k = nonZeroInt(-6, 6, rng);
  const a = nonZeroInt(-7, 7, rng);
  const b = nonZeroInt(-9, 9, rng);
  const resultA = k * a;
  const resultB = k * b;
  const inside = `${coefficientTerm(a, variable, 1, true)} ${coefficientTerm(b, variable, 0, false)}`;
  const answer = linearToText(resultA, resultB, variable);

  return makeQuestion({
    level: 3,
    type,
    prompt: `Khai triển biểu thức: ${k}(${inside}).`,
    answer,
    distractors: [
      linearToText(k + a, k + b, variable),
      linearToText(resultA, b, variable),
      linearToText(a, resultB, variable),
      linearToText(-resultA, -resultB, variable)
    ],
    explanation: [
      `Nhân ${k} với từng hạng tử trong ngoặc.`,
      `${k} · (${a}${variable}) = ${resultA}${variable} và ${k} · (${b}) = ${resultB}.`,
      `Kết quả là ${answer}.`
    ],
    answerLines: 3,
    tags: ['phân phối', 'khai triển'],
    rng
  });
}

function generateLevel4(type, rng) {
  const variable = pick(VARS, rng);
  const p = nonZeroInt(-5, 5, rng);
  const a = nonZeroInt(-6, 6, rng);
  const b = nonZeroInt(-8, 8, rng);
  const q = nonZeroInt(-5, 5, rng);
  const c = nonZeroInt(-6, 6, rng);
  const d = nonZeroInt(-8, 8, rng);

  const resultA = p * a + q * c;
  const resultB = p * b + q * d;
  const first = `${p}(${linearToText(a, b, variable)})`;
  const second = q >= 0
    ? `+ ${q}(${linearToText(c, d, variable)})`
    : `- ${Math.abs(q)}(${linearToText(c, d, variable)})`;
  const answer = linearToText(resultA, resultB, variable);

  return makeQuestion({
    level: 4,
    type,
    prompt: `Thu gọn biểu thức: ${first} ${second}.`,
    answer,
    distractors: [
      linearToText(p * a - q * c, p * b - q * d, variable),
      linearToText(p + a + q + c, b + d, variable),
      linearToText(resultA, -resultB, variable),
      linearToText(p * c + q * a, p * d + q * b, variable)
    ],
    explanation: [
      `Dùng tính chất phân phối để khai triển từng ngoặc.`,
      `Hệ số của ${variable} là ${p}·(${a}) + (${q})·(${c}) = ${resultA}.`,
      `Hạng tử tự do là ${p}·(${b}) + (${q})·(${d}) = ${resultB}.`,
      `Kết quả là ${answer}.`
    ],
    answerLines: 5,
    tags: ['nhiều bước', 'phân phối', 'thu gọn'],
    rng
  });
}

function generateLevel5(type, rng) {
  const variable = pick(VARS, rng);
  const a = nonZeroInt(-5, 5, rng);
  const b = nonZeroInt(-7, 7, rng);
  const c = nonZeroInt(-5, 5, rng);
  const d = nonZeroInt(-7, 7, rng);

  const qa = a * c;
  const qb = a * d + b * c;
  const qc = b * d;
  const left = `(${linearToText(a, b, variable)})`;
  const right = `(${linearToText(c, d, variable)})`;
  const answer = quadraticToText(qa, qb, qc, variable);

  return makeQuestion({
    level: 5,
    type,
    prompt: `Thực hiện phép nhân: ${left}${right}.`,
    answer,
    distractors: [
      quadraticToText(qa, a * d, qc, variable),
      quadraticToText(qa, b * c, qc, variable),
      quadraticToText(a + c, b + d, b * d, variable),
      quadraticToText(qa, -(a * d + b * c), qc, variable)
    ],
    explanation: [
      `Nhân mỗi hạng tử của ngoặc thứ nhất với từng hạng tử của ngoặc thứ hai.`,
      `Hệ số của ${variable}² là ${a}·(${c}) = ${qa}.`,
      `Hệ số của ${variable} là ${a}·(${d}) + (${b})·(${c}) = ${qb}.`,
      `Hạng tử tự do là ${b}·(${d}) = ${qc}.`,
      `Kết quả là ${answer}.`
    ],
    answerLines: 6,
    tags: ['nhân đa thức', 'nhị thức'],
    rng
  });
}

function generateLevel6(type, rng) {
  const variable = pick(VARS, rng);
  const identity = randomInt(1, 3, rng);
  const a = nonZeroInt(1, 7, rng);
  const b = nonZeroInt(1, 9, rng);

  let prompt;
  let answer;
  let distractors;
  let explanation;

  if (identity === 1) {
    prompt = `Khai triển: (${a}${variable} + ${b})².`;
    answer = quadraticToText(a * a, 2 * a * b, b * b, variable);
    distractors = [
      quadraticToText(a * a, a * b, b * b, variable),
      quadraticToText(a * a, -2 * a * b, b * b, variable),
      quadraticToText(a * a, 0, b * b, variable),
      quadraticToText(a, 2 * a * b, b, variable)
    ];
    explanation = [
      `Dùng hằng đẳng thức (A + B)² = A² + 2AB + B².`,
      `Với A = ${a}${variable}, B = ${b}.`,
      `Kết quả là ${answer}.`
    ];
  } else if (identity === 2) {
    prompt = `Khai triển: (${a}${variable} - ${b})².`;
    answer = quadraticToText(a * a, -2 * a * b, b * b, variable);
    distractors = [
      quadraticToText(a * a, 2 * a * b, b * b, variable),
      quadraticToText(a * a, -a * b, b * b, variable),
      quadraticToText(a * a, 0, -b * b, variable),
      quadraticToText(a, -2 * a * b, b, variable)
    ];
    explanation = [
      `Dùng hằng đẳng thức (A - B)² = A² - 2AB + B².`,
      `Với A = ${a}${variable}, B = ${b}.`,
      `Kết quả là ${answer}.`
    ];
  } else {
    prompt = `Thực hiện phép nhân: (${a}${variable} - ${b})(${a}${variable} + ${b}).`;
    answer = quadraticToText(a * a, 0, -(b * b), variable);
    distractors = [
      quadraticToText(a * a, 0, b * b, variable),
      quadraticToText(a * a, 2 * a * b, -(b * b), variable),
      quadraticToText(a * a, -2 * a * b, -(b * b), variable),
      quadraticToText(a, 0, -b, variable)
    ];
    explanation = [
      `Dùng hằng đẳng thức (A - B)(A + B) = A² - B².`,
      `Với A = ${a}${variable}, B = ${b}.`,
      `Kết quả là ${answer}.`
    ];
  }

  return makeQuestion({
    level: 6,
    type,
    prompt,
    answer,
    distractors,
    explanation,
    answerLines: 5,
    tags: ['hằng đẳng thức'],
    rng
  });
}

function generateLevel7(type, rng) {
  const variable = pick(VARS, rng);
  const a = nonZeroInt(1, 5, rng);
  const b = nonZeroInt(1, 7, rng);
  const k = nonZeroInt(-4, 4, rng);
  const c = nonZeroInt(-8, 8, rng);

  // (ax+b)^2 - k(ax+b) + c
  const qa = a * a;
  const qb = 2 * a * b - k * a;
  const qc = b * b - k * b + c;
  const binomial = `${a}${variable} + ${b}`;
  const middle = k >= 0 ? `- ${k}(${binomial})` : `+ ${Math.abs(k)}(${binomial})`;
  const expression = `(${binomial})² ${middle} ${signedNumber(c)}`;
  const answer = quadraticToText(qa, qb, qc, variable);

  return makeQuestion({
    level: 7,
    type,
    prompt: `Rút gọn biểu thức: ${expression}.`,
    answer,
    distractors: [
      quadraticToText(qa, 2 * a * b + k * a, b * b + k * b + c, variable),
      quadraticToText(qa, a * b - k * a, qc, variable),
      quadraticToText(qa, qb, b * b + k * b + c, variable),
      quadraticToText(qa, -qb, qc, variable)
    ],
    explanation: [
      `Khai triển bình phương (${binomial})² bằng hằng đẳng thức.`,
      `Khai triển tiếp tích ${k}(${binomial}) và chú ý dấu đứng trước tích.`,
      `Gom các hạng tử cùng bậc.`,
      `Kết quả là ${answer}.`
    ],
    answerLines: 7,
    tags: ['tổng hợp', 'hằng đẳng thức', 'thu gọn'],
    rng
  });
}

const LEVEL_GENERATORS = {
  1: generateLevel1,
  2: generateLevel2,
  3: generateLevel3,
  4: generateLevel4,
  5: generateLevel5,
  6: generateLevel6,
  7: generateLevel7
};

/**
 * Sinh một câu hỏi.
 * @param {Object} options
 * @param {number} options.level - Mức luyện từ 1 đến 7.
 * @param {'mcq'|'short-answer'} [options.type='mcq']
 * @param {Function} [options.rng=Math.random] - Hàm random trả về số trong [0, 1).
 */
export function generateQuestion({ level = 1, type = 'mcq', rng = Math.random } = {}) {
  const numericLevel = Number(level);
  if (!LEVEL_GENERATORS[numericLevel]) {
    throw new RangeError(`Mức luyện không hợp lệ: ${level}. Chỉ nhận từ 1 đến 7.`);
  }
  if (!topicInfo.supportedTypes.includes(type)) {
    throw new TypeError(`Loại câu hỏi không hợp lệ: ${type}.`);
  }
  if (typeof rng !== 'function') {
    throw new TypeError('rng phải là một hàm trả về số trong khoảng [0, 1).');
  }

  return LEVEL_GENERATORS[numericLevel](type, rng);
}

/** Sinh nhiều câu và hạn chế trùng nội dung trong cùng một lượt. */
export function generateQuestions({ level = 1, type = 'mcq', count = 1, rng = Math.random } = {}) {
  const total = Math.max(1, Math.min(100, Number(count) || 1));
  const result = [];
  const seen = new Set();
  let attempts = 0;

  while (result.length < total && attempts < total * 30) {
    const question = generateQuestion({ level, type, rng });
    if (!seen.has(question.question)) {
      seen.add(question.question);
      result.push(question);
    }
    attempts += 1;
  }

  if (result.length < total) {
    throw new Error(`Chỉ sinh được ${result.length}/${total} câu không trùng nhau.`);
  }

  return result;
}

export default {
  topicInfo,
  generateQuestion,
  generateQuestions
};
