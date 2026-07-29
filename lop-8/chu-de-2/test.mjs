import { generateQuestion, generateQuestions, topicInfo } from './generator.js';

if (topicInfo.levels.length !== 7) throw new Error('Thiếu mức luyện.');

for (let level = 1; level <= 7; level += 1) {
  for (const type of ['mcq', 'short-answer']) {
    for (let i = 0; i < 500; i += 1) {
      const q = generateQuestion({ level, type });
      if (!q.question || !q.answer || !Array.isArray(q.explanation) || q.explanation.length === 0) {
        throw new Error(`Dữ liệu thiếu ở level ${level}, type ${type}`);
      }
      if (type === 'mcq') {
        if (!Array.isArray(q.choices) || q.choices.length !== 4) throw new Error(`Choices lỗi ở level ${level}`);
        if (new Set(q.choices).size !== 4) throw new Error(`Choices trùng ở level ${level}`);
        if (q.correctIndex < 0 || q.choices[q.correctIndex] !== q.answer) throw new Error(`Đáp án MCQ lỗi ở level ${level}`);
      } else if (q.choices !== null || q.correctIndex !== null) {
        throw new Error(`Dữ liệu tự luận lỗi ở level ${level}`);
      }
    }
  }
  generateQuestions({ level, type: 'mcq', count: 10 });
  generateQuestions({ level, type: 'short-answer', count: 10 });
}

console.log('OK: Generator Chủ đề 2 đã vượt qua kiểm tra cấu trúc và sinh 7.000 câu thử.');
