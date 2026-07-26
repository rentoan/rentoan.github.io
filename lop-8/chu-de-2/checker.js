function baseNormalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("²", "^2")
    .replaceAll("³", "^3")
    .replaceAll("−", "-")
    .replaceAll("×", "*")
    .replaceAll("·", "*")
    .replace(/\s+/g, "")
    .replace(/\*+/g, "*")
    .replace(/^\+/, "")
    .replace(/\+\-/g, "-")
    .replace(/\-\-/g, "+");
}

function stripOptionalMultiplication(value) {
  return value
    .replace(/\*/g, "")
    .replace(/\^1(?!\d)/g, "");
}

export function canonical(value) {
  return stripOptionalMultiplication(baseNormalize(value));
}

export function equivalent(userAnswer, question) {
  const user = canonical(userAnswer);
  return question.accepted.some(answer => canonical(answer) === user);
}

export function diagnose(userAnswer, question) {
  const user = canonical(userAnswer);
  if (!user) return "Bạn chưa nhập đáp án.";
  if (!user.includes("(")) return "Em đã tìm được một phần kết quả nhưng còn thiếu ngoặc sau khi đặt nhân tử chung.";

  if (question.partialAnswers?.some(answer => canonical(answer) === user)) {
    return "Em đã đặt được nhân tử chung, nhưng chưa đặt hết nhân tử chung lớn nhất.";
  }

  if (question.signTrapAnswers?.some(answer => canonical(answer) === user)) {
    return "Em hãy kiểm tra lại dấu của từng hạng tử sau khi chia cho nhân tử chung.";
  }

  if (question.missingVariableAnswers?.some(answer => canonical(answer) === user)) {
    return "Em đã xử lí đúng hệ số nhưng còn thiếu một phần biến chung.";
  }

  return "Chưa đúng. Em hãy kiểm tra lại ƯCLN của các hệ số, phần biến chung và dấu trong ngoặc.";
}

export function pretty(value) {
  return String(value)
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/-/g, "−")
    .replace(/\*/g, "·");
}
