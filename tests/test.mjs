import { QuestionEngine } from './questionEngine.js';
import * as topic3 from '../admin/sinh-de/generators/chu-de-3.js';

const engine = new QuestionEngine();
engine.register(topic3);
let total = 0;
for (let level = 1; level <= 7; level += 1) {
  for (const type of ['mcq', 'short-answer']) {
    for (let i = 0; i < 500; i += 1) {
      const q = engine.generate({ topicId: 'chu-de-3', level, type, seed: `test:${level}:${type}:${i}` });
      if (!q.validation.valid) throw new Error(q.validation.errors.join('; '));
      if (type === 'mcq') {
        if (q.choices.length !== 4) throw new Error('MCQ không đủ 4 lựa chọn.');
        if (new Set(q.choices).size !== 4) throw new Error('MCQ có lựa chọn trùng.');
        if (q.choices[q.correctIndex] !== q.answer) throw new Error('Đáp án không khớp correctIndex.');
      }
      total += 1;
    }
  }
}
console.log(`OK: ${total} câu Chủ đề 3 hợp lệ.`);
