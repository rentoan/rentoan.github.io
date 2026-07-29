# RenToan v1.4.0 – Gói 1: Question Engine

Gói này là lõi sinh và kiểm tra câu hỏi. Chưa có giao diện và chưa xuất PDF.

## Cấu trúc

```text
engine/
  index.js
  questionEngine.js
  random.js
  utils.js
sample-generators/
  chu-de-1-generator.js
  chu-de-2-generator.js
tests/
  test-engine.mjs
package.json
```

Hai generator mẫu được kèm theo để chạy thử. Khi cập nhật dự án chính, bạn có thể giữ generator tại:

```text
lop-8/chu-de-1/generator.js
lop-8/chu-de-2/generator.js
```

và chỉ chép thư mục `engine/` vào nơi dự kiến:

```text
admin/sinh-de/engine/
```

## Đăng ký generator

```js
import { QuestionEngine } from './engine/index.js';
import * as chuDe1 from './lop-8/chu-de-1/generator.js';
import * as chuDe2 from './lop-8/chu-de-2/generator.js';

const engine = new QuestionEngine();
engine.register(chuDe1).register(chuDe2);
```

## Sinh một câu

```js
const question = engine.generate({
  topicId: 'chu-de-1',
  level: 2,
  type: 'mcq',
  seed: 'DE-001-CAU-01'
});
```

Cùng một seed, cùng generator và cùng phiên bản mã nguồn sẽ tái tạo cùng nội dung câu hỏi.

## Sinh nhiều câu không trùng

```js
const result = engine.generateMany({
  topicId: 'chu-de-2',
  level: 4,
  type: 'short-answer',
  count: 10,
  seed: 'DE-LUYEN-001'
});

console.log(result.seed);
console.log(result.questions);
```

## Kiểm thử trên máy

Cần Node.js 18 trở lên:

```bash
npm test
```

## Lưu ý về seed

Seed giúp tái tạo đề trong cùng phiên bản generator. Nếu thay đổi công thức sinh câu hỏi ở generator, đề cũ có thể thay đổi dù seed giữ nguyên. Ở giai đoạn lưu lịch sử đề, nên lưu thêm phiên bản generator hoặc toàn bộ snapshot đề.
