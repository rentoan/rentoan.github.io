import {
  commonFactorExplanation,
  polynomialFactorExplanation,
  recognitionExplanation
} from "./explanation.js";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(array) { return array[rand(0, array.length - 1)]; }
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
function coeff(n, variable = "") {
  if (!variable) return String(n);
  if (n === 1) return variable;
  if (n === -1) return `-${variable}`;
  return `${n}${variable}`;
}
function joinTerms(terms) {
  return terms.map((term, index) => {
    if (index === 0) return term;
    return term.startsWith("-") ? ` − ${term.slice(1)}` : ` + ${term}`;
  }).join("");
}
function productAccepted(factor, inside) {
  const values = [`${factor}(${inside})`, `(${inside})${factor}`];
  if (factor.startsWith("-")) {
    const positive = factor.slice(1);
    const flipped = flipPolynomialSigns(inside);
    values.push(`${positive}(${flipped})`, `(${flipped})${positive}`);
  }
  return values;
}
function flipPolynomialSigns(value) {
  const marked = value.replace(/-/g, "+-");
  return marked.split("+").filter(Boolean).map(term => term.startsWith("-") ? term.slice(1) : `-${term}`).join("+")
    .replace(/\+\-/g, "-").replace(/^\+/, "");
}
function textQuestion(data) {
  return { type: "text", ...data };
}
function choiceQuestion(expression, answer, choices, explanation) {
  return { type: "choice", expression, answer, accepted: [answer], choices: shuffle([...new Set(choices)]), explanation };
}

function level1() {
  const variable = pick(["x", "a", "m"]);
  const g = pick([2, 3, 4, 5, 6]);
  let p = rand(2, 5), q = rand(2, 5);
  while (gcd(p, q) !== 1) q = rand(2, 5);
  const a = g * p, b = g * q;
  const hasVariable = Math.random() < .55;
  const expression = hasVariable
    ? joinTerms([coeff(a, `${variable}^2`), coeff(b, variable)])
    : joinTerms([String(a), String(b)]);
  const answer = hasVariable ? `${g}${variable}` : String(gcd(a, b));
  const choices = hasVariable
    ? [answer, String(g), variable, `${g}${variable}^2`]
    : [answer, String(Math.min(a, b)), String(g), String(a + b)];
  return choiceQuestion(expression, answer, choices, recognitionExplanation(answer, expression));
}

function level2() {
  const g = pick([2, 3, 4, 5, 6, 7]);
  let p = rand(2, 7), q = rand(2, 7);
  while (gcd(p, q) !== 1) q = rand(2, 7);
  const expression = joinTerms([coeff(g * p, "x"), String(g * q)]);
  const inside = `${p}x+${q}`;
  const answer = `${g}(${inside})`;
  return textQuestion({
    expression, answer, accepted: productAccepted(String(g), inside),
    partialAnswers: p % 2 === 0 && q % 2 === 0 ? [`2(${(g*p)/2}x+${(g*q)/2})`] : [],
    explanation: commonFactorExplanation({ expression, factor: String(g), inside, coefficientGcd: g })
  });
}

function level3() {
  const g = pick([2, 3, 4, 5, 6]);
  let p = rand(2, 6), q = rand(1, 6);
  while (gcd(p, q) !== 1) q = rand(1, 6);
  const pattern = Math.random() < .5 ? 0 : 1;
  const expression = pattern === 0
    ? joinTerms([coeff(-g * p, "x"), String(g * q)])
    : joinTerms([coeff(g * p, "x"), String(-g * q)]);
  const factor = pattern === 0 ? `-${g}` : String(g);
  const inside = pattern === 0 ? `${p}x-${q}` : `${p}x-${q}`;
  const answer = `${factor}(${inside})`;
  const accepted = pattern === 0
    ? productAccepted(factor, inside)
    : productAccepted(factor, inside);
  const signTrap = pattern === 0 ? [`-${g}(${p}x+${q})`] : [`${g}(${p}x+${q})`];
  return textQuestion({
    expression, answer, accepted,
    signTrapAnswers: signTrap,
    explanation: commonFactorExplanation({
      expression, factor, inside, coefficientGcd: g,
      note: pattern === 0 ? "Đặt hệ số âm giúp hạng tử đầu trong ngoặc mang dấu dương." : "Giữ nguyên dấu âm của hạng tử thứ hai trong ngoặc."
    })
  });
}

function level4() {
  const variable = pick(["x", "a", "m"]);
  const c = rand(1, 6);
  const p = rand(2, 7), q = rand(1, 6);
  const block = `(${variable}+${c})`;
  const expression = `${p}${block} + ${q}${variable}${block}`;
  const inside = `${p}+${q}${variable}`;
  const answer = `${block}(${inside})`;
  return textQuestion({
    expression, answer,
    accepted: [answer, `(${inside})${block}`],
    explanation: polynomialFactorExplanation({ expression, factor: block, inside })
  });
}

function level5() {
  const g = pick([2, 3, 4, 5, 6]);
  let p = rand(2, 6), q = rand(2, 6);
  while (gcd(p, q) !== 1) q = rand(2, 6);
  const x1 = rand(2, 4), x2 = rand(1, x1);
  const y1 = rand(1, 3), y2 = rand(y1, 4);
  const commonX = Math.min(x1, x2), commonY = Math.min(y1, y2);
  const factorVar = `${commonX === 1 ? "x" : `x^${commonX}`}${commonY === 1 ? "y" : `y^${commonY}`}`;
  const firstRemain = `${p}${x1-commonX ? `x${x1-commonX > 1 ? `^${x1-commonX}` : ""}` : ""}${y1-commonY ? `y${y1-commonY > 1 ? `^${y1-commonY}` : ""}` : ""}`;
  const secondRemain = `${q}${x2-commonX ? `x${x2-commonX > 1 ? `^${x2-commonX}` : ""}` : ""}${y2-commonY ? `y${y2-commonY > 1 ? `^${y2-commonY}` : ""}` : ""}`;
  const term1 = `${g*p}x${x1 > 1 ? `^${x1}` : ""}y${y1 > 1 ? `^${y1}` : ""}`;
  const term2 = `${g*q}x${x2 > 1 ? `^${x2}` : ""}y${y2 > 1 ? `^${y2}` : ""}`;
  const expression = `${term1} + ${term2}`;
  const factor = `${g}${factorVar}`;
  const inside = `${firstRemain}+${secondRemain}`;
  const answer = `${factor}(${inside})`;
  return textQuestion({
    expression, answer, accepted: productAccepted(factor, inside),
    missingVariableAnswers: [`${g}(${term1.slice(String(g).length)}+${term2.slice(String(g).length)})`],
    explanation: commonFactorExplanation({ expression, factor, inside, coefficientGcd: g, variablePart: factorVar })
  });
}

function level6() {
  const g = pick([3, 4, 5, 6, 7]);
  let p = rand(2, 7), q = rand(2, 7), r = rand(1, 6);
  while (gcd(gcd(p, q), r) !== 1) r = rand(1, 6);
  const expression = joinTerms([
    coeff(-g*p, "a^2b"),
    coeff(g*q, "ab^2"),
    coeff(-g*r, "ab")
  ]);
  const factor = `-${g}ab`;
  const inside = `${p}a-${q}b+${r}`;
  const answer = `${factor}(${inside})`;
  return textQuestion({
    expression, answer, accepted: productAccepted(factor, inside),
    signTrapAnswers: [`-${g}ab(${p}a+${q}b-${r})`, `${g}ab(${p}a-${q}b+${r})`],
    explanation: commonFactorExplanation({ expression, factor, inside, coefficientGcd: g, variablePart: "ab", note: "Chia từng hạng tử cho −" + g + "ab và kiểm tra lại dấu." })
  });
}

function level7() {
  return pick([level2, level3, level4, level5, level6])();
}

export const generators = [level1, level2, level3, level4, level5, level6, level7];

export function generateQuestion(levelIndex) {
  return generators[levelIndex]();
}
