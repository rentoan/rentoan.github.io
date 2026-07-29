import { generateQuestion, generateQuestions } from './generator.js';

for (let level = 1; level <= 7; level += 1) {
  for (const type of ['mcq', 'short-answer']) {
    for (let i = 0; i < 200; i += 1) {
      const q = generateQuestion({ level, type });
      if (!q.question || !q.answer || !Array.isArray(q.explanation)) {
        throw new Error(`Dữ liệu thiếu ở level ${level}, type ${type}`);
      }
      if (type === 'mcq') {
        if (!Array.isArray(q.choices) || q.choices.length !== 4) {
          throw new Error(`Choices lỗi ở level ${level}`);
        }
        if (q.correctIndex < 0 || q.choices[q.correctIndex] !== q.answer) {
          throw new Error(`Đáp án trắc nghiệm lỗi ở level ${level}`);
        }
      }
    }
  }
  generateQuestions({ level, type: 'mcq', count: 10 });
}

console.log('OK: Generator Chủ đề 1 đã vượt qua kiểm tra cấu trúc.');
