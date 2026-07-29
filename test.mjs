import { generateQuestion } from "./lop-8/chu-de-4/generator.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (let level = 0; level < 7; level++) {
  for (let i = 0; i < 2500; i++) {
    const q = generateQuestion(level);
    assert(q && typeof q === "object", `Mức ${level + 1}: câu hỏi không hợp lệ`);
    assert(["text", "choice"].includes(q.type), `Mức ${level + 1}: sai type`);
    assert(typeof q.prompt === "string" && q.prompt.length > 0, `Mức ${level + 1}: thiếu prompt`);
    assert(typeof q.expression === "string", `Mức ${level + 1}: thiếu expression`);
    assert(typeof q.answer === "string", `Mức ${level + 1}: thiếu answer`);
    assert(Array.isArray(q.accepted) && q.accepted.length > 0, `Mức ${level + 1}: thiếu accepted`);
    assert(typeof q.explanation === "string" && q.explanation.length > 0, `Mức ${level + 1}: thiếu explanation`);
    if (q.type === "choice") {
      assert(Array.isArray(q.choices) && q.choices.length === 4, `Mức ${level + 1}: MCQ không đủ 4 lựa chọn`);
      assert(new Set(q.choices).size === 4, `Mức ${level + 1}: lựa chọn bị trùng`);
      assert(q.choices.includes(q.answer), `Mức ${level + 1}: lựa chọn không chứa đáp án`);
    }
  }
}
console.log("OK: Chương 4 vượt qua 17.500 lượt sinh và kiểm tra câu hỏi.");
