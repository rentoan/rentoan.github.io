/**
 * RenToan v1.4 - Question Generator
 * Chủ đề 3: Tứ giác
 *
 * Dùng chung cho xem trước đề, sinh PDF đề và PDF đáp án.
 */

export const topicInfo = Object.freeze({
  grade: 8,
  topicId: 'chu-de-3',
  topicName: 'Tứ giác',
  version: '1.4.0',
  levels: [
    { id: 1, name: 'Tổng các góc của tứ giác' },
    { id: 2, name: 'Hình thang và hình thang cân' },
    { id: 3, name: 'Hình bình hành' },
    { id: 4, name: 'Hình chữ nhật' },
    { id: 5, name: 'Hình thoi' },
    { id: 6, name: 'Hình vuông' },
    { id: 7, name: 'Luyện tập tổng hợp' }
  ],
  supportedTypes: ['mcq', 'short-answer']
});

function randomInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(array, rng = Math.random) {
  return array[randomInt(0, array.length - 1, rng)];
}

function shuffle(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i, rng);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalize(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(normalize);
}

function makeChoices(correct, distractors, rng = Math.random) {
  let pool = unique([correct, ...distractors]);
  let guard = 1;
  while (pool.length < 4) {
    pool = unique([...pool, `${correct} (${guard})`]);
    guard += 1;
  }
  const choices = shuffle(pool.slice(0, 4), rng);
  return { choices, correctIndex: choices.indexOf(normalize(correct)) };
}

function makeQuestion({
  level,
  type,
  question,
  answer,
  explanation,
  distractors = [],
  answerLines = 4,
  tags = [],
  rng = Math.random
}) {
  const base = {
    id: `CD3-L${level}-${Date.now()}-${randomInt(1000, 9999, rng)}`,
    grade: 8,
    topicId: topicInfo.topicId,
    topicName: topicInfo.topicName,
    level,
    levelName: topicInfo.levels.find((item) => item.id === level)?.name || '',
    type,
    question: normalize(question),
    answer: normalize(answer),
    explanation: (Array.isArray(explanation) ? explanation : [explanation]).map(normalize),
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

function angleDistractors(answer) {
  return unique([
    `${Math.max(1, answer - 10)}°`,
    `${answer + 10}°`,
    `${180 - answer}°`,
    `${360 - answer}°`
  ]).filter((item) => item !== `${answer}°`);
}

function lengthDistractors(answer, unit = 'cm') {
  return unique([
    `${Math.max(1, answer - 1)} ${unit}`,
    `${answer + 1} ${unit}`,
    `${answer * 2} ${unit}`,
    `${Math.max(1, Math.floor(answer / 2))} ${unit}`
  ]).filter((item) => item !== `${answer} ${unit}`);
}

function generateLevel1(type, rng) {
  const form = randomInt(1, 3, rng);
  if (form === 1) {
    let a; let b; let c; let d;
    do {
      a = randomInt(55, 115, rng);
      b = randomInt(55, 115, rng);
      c = randomInt(55, 115, rng);
      d = 360 - a - b - c;
    } while (d < 25 || d > 155);
    return makeQuestion({
      level: 1, type,
      question: `Tứ giác ABCD có ∠A = ${a}°, ∠B = ${b}°, ∠C = ${c}°. Tính ∠D.`,
      answer: `${d}°`,
      distractors: angleDistractors(d),
      explanation: [`Tổng bốn góc trong một tứ giác bằng 360°.`, `∠D = 360° - ${a}° - ${b}° - ${c}° = ${d}°.`],
      answerLines: 3,
      tags: ['tổng góc tứ giác'], rng
    });
  }
  if (form === 2) {
    const k = pick([2, 3], rng);
    let x; let a; let b; let c;
    do {
      x = randomInt(25, 75, rng);
      a = randomInt(45, 100, rng);
      b = randomInt(45, 100, rng);
      c = 360 - a - b - k * x;
    } while (c < 25 || c > 145);
    return makeQuestion({
      level: 1, type,
      question: `Các góc của một tứ giác lần lượt là ${a}°, ${b}°, ${k}x° và ${c}°. Tìm x.`,
      answer: `${x}`,
      distractors: [`${x - 5}`, `${x + 5}`, `${k * x}`, `${Math.floor(x / k)}`],
      explanation: [`Ta có ${a} + ${b} + ${k}x + ${c} = 360.`, `Suy ra ${k}x = ${k * x}, nên x = ${x}.`],
      answerLines: 4,
      tags: ['tổng góc tứ giác', 'tìm x'], rng
    });
  }
  const outside = randomInt(35, 145, rng);
  const inside = 180 - outside;
  return makeQuestion({
    level: 1, type,
    question: `Một góc ngoài của tứ giác có số đo ${outside}° và kề bù với góc trong tại cùng đỉnh. Tính góc trong đó.`,
    answer: `${inside}°`,
    distractors: angleDistractors(inside),
    explanation: [`Hai góc kề bù có tổng bằng 180°.`, `Góc trong bằng 180° - ${outside}° = ${inside}°.`],
    answerLines: 3,
    tags: ['góc kề bù'], rng
  });
}

function generateLevel2(type, rng) {
  const form = randomInt(1, 5, rng);
  if (form === 1) {
    return makeQuestion({
      level: 2, type,
      question: 'Cho hình thang ABCD có AB ∥ CD. Cặp cạnh nào là hai đáy của hình thang?',
      answer: 'AB và CD',
      distractors: ['AD và BC', 'AB và BC', 'AC và BD', 'AD và CD'],
      explanation: ['Trong hình thang, hai cạnh đối song song được gọi là hai đáy.', 'Vì AB ∥ CD nên AB và CD là hai đáy.'],
      tags: ['hình thang', 'nhận biết'], rng
    });
  }
  if (form === 2) {
    const a = randomInt(45, 130, rng);
    const d = 180 - a;
    return makeQuestion({
      level: 2, type,
      question: `Hình thang ABCD có AB ∥ CD và ∠A = ${a}°. Tính ∠D.`,
      answer: `${d}°`,
      distractors: angleDistractors(d),
      explanation: [`∠A và ∠D là hai góc trong cùng phía tạo bởi hai đường thẳng song song.`, `∠D = 180° - ${a}° = ${d}°.`],
      tags: ['hình thang', 'góc trong cùng phía'], rng
    });
  }
  if (form === 3) {
    const a = randomInt(50, 125, rng);
    return makeQuestion({
      level: 2, type,
      question: `Hình thang cân ABCD có AB ∥ CD và ∠A = ${a}°. Tính ∠B.`,
      answer: `${a}°`,
      distractors: angleDistractors(a),
      explanation: [`Hai góc kề cùng một đáy của hình thang cân bằng nhau.`, `Do đó ∠B = ∠A = ${a}°.`],
      tags: ['hình thang cân', 'góc kề đáy'], rng
    });
  }
  if (form === 4) {
    const ac = randomInt(6, 24, rng);
    return makeQuestion({
      level: 2, type,
      question: `Hình thang cân ABCD có AB ∥ CD và đường chéo AC = ${ac} cm. Tính BD.`,
      answer: `${ac} cm`,
      distractors: lengthDistractors(ac),
      explanation: [`Hai đường chéo của hình thang cân bằng nhau.`, `Vì AC = ${ac} cm nên BD = ${ac} cm.`],
      tags: ['hình thang cân', 'đường chéo'], rng
    });
  }
  return makeQuestion({
    level: 2, type,
    question: 'Khẳng định nào luôn đúng với hình thang cân?',
    answer: 'Hai góc kề mỗi đáy bằng nhau',
    distractors: ['Hai cạnh bên song song', 'Hai đường chéo vuông góc', 'Bốn cạnh bằng nhau', 'Bốn góc vuông'],
    explanation: ['Trong hình thang cân, hai góc kề một đáy bằng nhau và hai đường chéo bằng nhau.'],
    tags: ['hình thang cân', 'tính chất'], rng
  });
}

function generateLevel3(type, rng) {
  const form = randomInt(1, 5, rng);
  if (form === 1) {
    const a = randomInt(45, 135, rng);
    const b = 180 - a;
    return makeQuestion({ level: 3, type,
      question: `Hình bình hành ABCD có ∠A = ${a}°. Tính ∠B.`, answer: `${b}°`, distractors: angleDistractors(b),
      explanation: [`Hai góc kề nhau trong hình bình hành bù nhau.`, `∠B = 180° - ${a}° = ${b}°.`], tags: ['hình bình hành', 'góc'], rng });
  }
  if (form === 2) {
    const ab = randomInt(4, 20, rng);
    return makeQuestion({ level: 3, type,
      question: `Hình bình hành ABCD có AB = ${ab} cm. Tính CD.`, answer: `${ab} cm`, distractors: lengthDistractors(ab),
      explanation: [`Các cạnh đối của hình bình hành bằng nhau.`, `Do đó CD = AB = ${ab} cm.`], tags: ['hình bình hành', 'cạnh đối'], rng });
  }
  if (form === 3) {
    const ao = randomInt(3, 18, rng);
    return makeQuestion({ level: 3, type,
      question: `Hai đường chéo AC và BD của hình bình hành ABCD cắt nhau tại O. Biết AO = ${ao} cm. Tính OC.`, answer: `${ao} cm`, distractors: lengthDistractors(ao),
      explanation: [`Hai đường chéo hình bình hành cắt nhau tại trung điểm mỗi đường.`, `Vì O là trung điểm AC nên OC = AO = ${ao} cm.`], tags: ['hình bình hành', 'đường chéo'], rng });
  }
  if (form === 4) {
    return makeQuestion({ level: 3, type,
      question: 'Tứ giác ABCD có hai đường chéo cắt nhau tại trung điểm của mỗi đường. Kết luận nào chắc chắn đúng?', answer: 'ABCD là hình bình hành',
      distractors: ['ABCD là hình thang cân', 'ABCD là hình chữ nhật', 'ABCD là hình thoi', 'ABCD là hình vuông'],
      explanation: ['Tứ giác có hai đường chéo cắt nhau tại trung điểm của mỗi đường là hình bình hành.'], tags: ['dấu hiệu nhận biết'], rng });
  }
  return makeQuestion({ level: 3, type,
    question: 'Khẳng định nào luôn đúng với hình bình hành?', answer: 'Hai đường chéo cắt nhau tại trung điểm mỗi đường',
    distractors: ['Hai đường chéo luôn vuông góc', 'Hai đường chéo luôn bằng nhau', 'Bốn góc vuông', 'Bốn cạnh bằng nhau'],
    explanation: ['Trong hình bình hành, hai đường chéo cắt nhau tại trung điểm của mỗi đường.'], tags: ['hình bình hành', 'tính chất'], rng });
}

function generateLevel4(type, rng) {
  const form = randomInt(1, 5, rng);
  if (form === 1) {
    const ac = randomInt(6, 24, rng);
    return makeQuestion({ level: 4, type,
      question: `Hình chữ nhật ABCD có AC = ${ac} cm. Tính BD.`, answer: `${ac} cm`, distractors: lengthDistractors(ac),
      explanation: [`Hai đường chéo của hình chữ nhật bằng nhau.`, `Vì AC = ${ac} cm nên BD = ${ac} cm.`], tags: ['hình chữ nhật', 'đường chéo'], rng });
  }
  if (form === 2) {
    const ao = randomInt(3, 15, rng);
    const ac = 2 * ao;
    return makeQuestion({ level: 4, type,
      question: `Hai đường chéo của hình chữ nhật ABCD cắt nhau tại O. Biết AO = ${ao} cm. Tính AC.`, answer: `${ac} cm`, distractors: lengthDistractors(ac),
      explanation: [`O là trung điểm của AC.`, `AC = 2·AO = 2·${ao} = ${ac} cm.`], tags: ['hình chữ nhật', 'trung điểm'], rng });
  }
  if (form === 3) {
    return makeQuestion({ level: 4, type,
      question: 'Một hình bình hành có thêm điều kiện nào thì trở thành hình chữ nhật?', answer: 'Có một góc vuông',
      distractors: ['Có hai cạnh kề bằng nhau', 'Hai đường chéo vuông góc', 'Một đường chéo là phân giác một góc', 'Có bốn cạnh bằng nhau'],
      explanation: ['Hình bình hành có một góc vuông thì cả bốn góc đều vuông, nên là hình chữ nhật.'], tags: ['dấu hiệu nhận biết'], rng });
  }
  if (form === 4) {
    return makeQuestion({ level: 4, type,
      question: 'Khẳng định nào không nhất thiết đúng với mọi hình chữ nhật?', answer: 'Hai đường chéo vuông góc',
      distractors: ['Hai đường chéo bằng nhau', 'Bốn góc vuông', 'Các cạnh đối bằng nhau', 'Hai đường chéo cắt nhau tại trung điểm'],
      explanation: ['Hai đường chéo của hình chữ nhật bằng nhau và cắt nhau tại trung điểm, nhưng không nhất thiết vuông góc.'], tags: ['hình chữ nhật', 'phản ví dụ'], rng });
  }
  return makeQuestion({ level: 4, type,
    question: 'Một hình bình hành có hai đường chéo bằng nhau. Hình đó là hình gì?', answer: 'Hình chữ nhật',
    distractors: ['Hình thoi', 'Hình thang cân', 'Hình vuông trong mọi trường hợp', 'Tứ giác bất kỳ'],
    explanation: ['Hình bình hành có hai đường chéo bằng nhau là hình chữ nhật.'], tags: ['dấu hiệu nhận biết'], rng });
}

function generateLevel5(type, rng) {
  const form = randomInt(1, 5, rng);
  if (form === 1) {
    const side = randomInt(4, 18, rng);
    return makeQuestion({ level: 5, type,
      question: `Hình thoi ABCD có AB = ${side} cm. Tính BC.`, answer: `${side} cm`, distractors: lengthDistractors(side),
      explanation: [`Bốn cạnh của hình thoi bằng nhau.`, `Vì AB = ${side} cm nên BC = ${side} cm.`], tags: ['hình thoi', 'cạnh'], rng });
  }
  if (form === 2) {
    const half = pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70], rng);
    const full = 2 * half;
    return makeQuestion({ level: 5, type,
      question: `Trong hình thoi ABCD, đường chéo AC là phân giác ∠A. Biết ∠BAC = ${half}°. Tính ∠A.`, answer: `${full}°`, distractors: angleDistractors(full),
      explanation: [`AC là phân giác ∠A nên ∠BAC = ∠CAD.`, `∠A = 2·${half}° = ${full}°.`], tags: ['hình thoi', 'phân giác'], rng });
  }
  if (form === 3) {
    return makeQuestion({ level: 5, type,
      question: 'Một hình bình hành có hai cạnh kề bằng nhau. Hình đó là hình gì?', answer: 'Hình thoi',
      distractors: ['Hình chữ nhật', 'Hình thang cân', 'Hình vuông trong mọi trường hợp', 'Tứ giác bất kỳ'],
      explanation: ['Trong hình bình hành, các cạnh đối bằng nhau. Nếu hai cạnh kề cũng bằng nhau thì cả bốn cạnh bằng nhau, nên là hình thoi.'], tags: ['dấu hiệu nhận biết'], rng });
  }
  if (form === 4) {
    return makeQuestion({ level: 5, type,
      question: 'Khẳng định nào luôn đúng với hình thoi?', answer: 'Hai đường chéo vuông góc',
      distractors: ['Hai đường chéo luôn bằng nhau', 'Bốn góc vuông', 'Chỉ có một cặp cạnh đối song song', 'Hai đường chéo không cắt nhau'],
      explanation: ['Hai đường chéo của hình thoi vuông góc và là các đường phân giác của các góc.'], tags: ['hình thoi', 'tính chất'], rng });
  }
  return makeQuestion({ level: 5, type,
    question: 'Một hình bình hành có hai đường chéo vuông góc. Hình đó là hình gì?', answer: 'Hình thoi',
    distractors: ['Hình chữ nhật', 'Hình thang cân', 'Hình vuông trong mọi trường hợp', 'Hình thang'],
    explanation: ['Hình bình hành có hai đường chéo vuông góc là hình thoi.'], tags: ['dấu hiệu nhận biết'], rng });
}

function generateLevel6(type, rng) {
  const form = randomInt(1, 5, rng);
  if (form === 1) {
    const side = randomInt(3, 20, rng);
    const perimeter = 4 * side;
    return makeQuestion({ level: 6, type,
      question: `Một hình vuông có cạnh dài ${side} cm. Tính chu vi.`, answer: `${perimeter} cm`, distractors: lengthDistractors(perimeter),
      explanation: [`Chu vi hình vuông bằng bốn lần độ dài cạnh.`, `P = 4·${side} = ${perimeter} cm.`], tags: ['hình vuông', 'chu vi'], rng });
  }
  if (form === 2) {
    return makeQuestion({ level: 6, type,
      question: 'Đường chéo AC của hình vuông ABCD chia ∠A thành hai góc bằng nhau. Tính ∠BAC.', answer: '45°',
      distractors: ['30°', '60°', '90°', '135°'],
      explanation: ['Mỗi góc của hình vuông bằng 90° và đường chéo là phân giác góc.', '∠BAC = 90° : 2 = 45°.'], tags: ['hình vuông', 'phân giác'], rng });
  }
  if (form === 3) {
    return makeQuestion({ level: 6, type,
      question: 'Một hình chữ nhật có thêm điều kiện nào thì trở thành hình vuông?', answer: 'Hai cạnh kề bằng nhau',
      distractors: ['Hai đường chéo bằng nhau', 'Hai cạnh đối song song', 'Bốn góc vuông', 'Hai đường chéo cắt nhau tại trung điểm'],
      explanation: ['Hình chữ nhật đã có bốn góc vuông. Nếu hai cạnh kề bằng nhau thì bốn cạnh bằng nhau, nên là hình vuông.'], tags: ['dấu hiệu nhận biết'], rng });
  }
  if (form === 4) {
    return makeQuestion({ level: 6, type,
      question: 'Khẳng định nào đúng với mọi hình vuông?', answer: 'Hai đường chéo bằng nhau và vuông góc',
      distractors: ['Chỉ có một cặp cạnh song song', 'Hai đường chéo không cắt nhau', 'Các góc đối không bằng nhau', 'Hai cạnh kề không bằng nhau'],
      explanation: ['Hình vuông vừa là hình chữ nhật vừa là hình thoi, nên hai đường chéo vừa bằng nhau vừa vuông góc.'], tags: ['hình vuông', 'tính chất'], rng });
  }
  return makeQuestion({ level: 6, type,
    question: 'Một hình thoi có một góc vuông. Hình đó là hình gì?', answer: 'Hình vuông',
    distractors: ['Hình chữ nhật không phải hình vuông', 'Hình thang cân', 'Hình bình hành bất kỳ', 'Tứ giác bất kỳ'],
    explanation: ['Hình thoi là hình bình hành. Hình bình hành có một góc vuông là hình chữ nhật; vừa là hình thoi vừa là hình chữ nhật nên là hình vuông.'], tags: ['dấu hiệu nhận biết'], rng });
}

function generateLevel7(type, rng) {
  const form = randomInt(1, 7, rng);
  const conceptual = [
    ['Tứ giác có hai đường chéo cắt nhau tại trung điểm mỗi đường là hình gì?', 'Hình bình hành', ['Hình thang cân', 'Hình thoi', 'Hình chữ nhật', 'Hình vuông'], 'Đây là dấu hiệu nhận biết hình bình hành.'],
    ['Hình bình hành có hai đường chéo bằng nhau là hình gì?', 'Hình chữ nhật', ['Hình thoi', 'Hình thang cân', 'Hình vuông trong mọi trường hợp', 'Tứ giác bất kỳ'], 'Đây là dấu hiệu nhận biết hình chữ nhật.'],
    ['Hình bình hành có hai đường chéo vuông góc là hình gì?', 'Hình thoi', ['Hình chữ nhật', 'Hình thang cân', 'Hình vuông trong mọi trường hợp', 'Hình thang'], 'Đây là dấu hiệu nhận biết hình thoi.'],
    ['Hình chữ nhật có hai đường chéo vuông góc là hình gì?', 'Hình vuông', ['Hình thang', 'Hình bình hành không đặc biệt', 'Hình thang cân', 'Tứ giác bất kỳ'], 'Hình chữ nhật có hai đường chéo vuông góc đồng thời là hình thoi, nên là hình vuông.'],
    ['Hình thoi có hai đường chéo bằng nhau là hình gì?', 'Hình vuông', ['Hình chữ nhật không phải hình vuông', 'Hình thang cân', 'Hình bình hành bất kỳ', 'Tứ giác bất kỳ'], 'Hình thoi có hai đường chéo bằng nhau đồng thời là hình chữ nhật, nên là hình vuông.']
  ];
  if (form <= 5) {
    const [question, answer, distractors, explanation] = conceptual[form - 1];
    return makeQuestion({ level: 7, type, question, answer, distractors, explanation, answerLines: 4, tags: ['tổng hợp', 'nhận biết hình'], rng });
  }
  if (form === 6) {
    const a = randomInt(50, 130, rng);
    const c = 180 - a;
    return makeQuestion({ level: 7, type,
      question: `Hình thang cân ABCD có AB ∥ CD và ∠A = ${a}°. Tính ∠C.`, answer: `${c}°`, distractors: angleDistractors(c),
      explanation: [`Trong hình thang cân, ∠A = ∠B.`, `Do AB ∥ CD nên ∠B + ∠C = 180°.`, `Vậy ∠C = 180° - ${a}° = ${c}°.`], answerLines: 5, tags: ['tổng hợp', 'hình thang cân'], rng });
  }
  const ao = randomInt(3, 12, rng);
  const bd = 2 * ao;
  return makeQuestion({ level: 7, type,
    question: `Hình vuông ABCD có hai đường chéo cắt nhau tại O. Biết AO = ${ao} cm. Tính BD.`, answer: `${bd} cm`, distractors: lengthDistractors(bd),
    explanation: [`O là trung điểm của AC nên AC = 2·AO = ${bd} cm.`, `Hai đường chéo hình vuông bằng nhau nên BD = AC = ${bd} cm.`], answerLines: 5, tags: ['tổng hợp', 'hình vuông', 'đường chéo'], rng });
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

export function generateQuestion({ level = 1, type = 'mcq', rng = Math.random } = {}) {
  const generator = LEVEL_GENERATORS[level];
  if (!generator) throw new RangeError(`Level ${level} không tồn tại trong Chủ đề 3.`);
  if (!topicInfo.supportedTypes.includes(type)) throw new RangeError(`Kiểu câu hỏi không hỗ trợ: ${type}.`);
  return generator(type, rng);
}

export function generateQuestions({ level = 1, type = 'mcq', count = 1, rng = Math.random } = {}) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('count phải là số nguyên dương.');
  return Array.from({ length: count }, () => generateQuestion({ level, type, rng }));
}
