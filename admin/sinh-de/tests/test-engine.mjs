import assert from 'node:assert/strict';
import { QuestionEngine, createSeededRandom, validateQuestion } from '../engine/index.js';
import * as topic1 from '../sample-generators/chu-de-1-generator.js';
import * as topic2 from '../sample-generators/chu-de-2-generator.js';

const a = createSeededRandom('abc');
const b = createSeededRandom('abc');
for (let i = 0; i < 100; i += 1) assert.equal(a(), b(), 'Cùng seed phải cho cùng chuỗi số.');

const engine = new QuestionEngine();
engine.register(topic1).register(topic2);
assert.equal(engine.listTopics({ grade: 8 }).length, 2);

for (const topicId of ['chu-de-1', 'chu-de-2']) {
  for (let level = 1; level <= 7; level += 1) {
    for (const type of ['mcq', 'short-answer']) {
      const first = engine.generate({ topicId, level, type, seed: `${topicId}-${level}-${type}` });
      const second = engine.generate({ topicId, level, type, seed: `${topicId}-${level}-${type}` });
      assert.equal(first.question, second.question, 'Cùng seed phải tái tạo cùng đề.');
      assert.equal(first.answer, second.answer, 'Cùng seed phải tái tạo cùng đáp án.');
      assert.equal(validateQuestion(first, engine.getTopic(topicId)).valid, true);
    }
  }
}

const batch = engine.generateMany({ topicId: 'chu-de-1', level: 2, type: 'mcq', count: 20, seed: 'bo-20-cau' });
assert.equal(batch.questions.length, 20);
assert.equal(new Set(batch.questions.map((q) => q.question)).size, 20);

console.log('OK: Question Engine vượt qua toàn bộ kiểm thử.');
