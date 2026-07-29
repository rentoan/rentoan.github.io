function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replaceAll("−", "-")
    .replaceAll("×", "x")
    .replaceAll("·", "x")
    .replaceAll(",", ".")
    .replace(/\s+/g, " ")
    .replace(/[.;:!?]+$/g, "")
    .trim();
}

function numericValue(value) {
  const cleaned = normalize(value)
    .replace(/(cm|m|km|mm|độ|°)$/g, "")
    .trim();
  if (/^-?\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned);
  const fraction = cleaned.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  return null;
}

export function equivalent(userAnswer, question) {
  const user = normalize(userAnswer);
  if (question.accepted.some(answer => normalize(answer) === user)) return true;
  const userNumber = numericValue(userAnswer);
  if (userNumber === null) return false;
  return question.accepted.some(answer => {
    const expected = numericValue(answer);
    return expected !== null && Math.abs(userNumber - expected) < 1e-9;
  });
}

export function diagnose(userAnswer, question) {
  if (!normalize(userAnswer)) return "Bạn chưa nhập đáp án.";
  return question.hint || "Chưa đúng. Em hãy xác định các đoạn thẳng tương ứng và viết tỉ lệ trước khi tính.";
}

export function pretty(value) {
  return String(value)
    .replaceAll("*", "×")
    .replaceAll("deg", "°");
}
