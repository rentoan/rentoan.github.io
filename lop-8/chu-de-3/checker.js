function normalize(value) {
  return String(value ?? "")
    .toLowerCase().trim()
    .replaceAll("°", "")
    .replaceAll("độ", "")
    .replaceAll("−", "-")
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "")
    .trim();
}
export function equivalent(userAnswer, question) {
  const user = normalize(userAnswer);
  return question.accepted.some(answer => normalize(answer) === user);
}
export function diagnose(userAnswer, question) {
  if (!normalize(userAnswer)) return "Bạn chưa nhập đáp án.";
  return question.hint || "Chưa đúng. Em hãy đối chiếu dữ kiện với định nghĩa và tính chất của hình.";
}
export function pretty(value) { return String(value).replace(/\bdeg\b/g, "°"); }
