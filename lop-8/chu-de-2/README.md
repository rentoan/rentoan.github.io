# RenToan v1.4 - Generator Chủ đề 2

## Chủ đề

**Phân tích đa thức thành nhân tử - Toán 8**

## Cập nhật vào GitHub

Đặt `generator.js` tại:

```text
lop-8/chu-de-2/generator.js
```

Nếu thư mục này đã có `generator.js` phục vụ luyện trực tuyến, hãy sao lưu file cũ trước khi thay. Module sinh đề v1.4 sẽ import generator này.

## Các mức luyện

1. Đặt nhân tử chung là một số.
2. Đặt nhân tử chung là đơn thức.
3. Đặt nhân tử chung và xử lí dấu.
4. Dùng hằng đẳng thức.
5. Nhóm các hạng tử.
6. Phối hợp nhiều phương pháp.
7. Phân tích tổng hợp.

## Ví dụ sử dụng

```javascript
import { generateQuestion, generateQuestions } from './generator.js';

const q = generateQuestion({ level: 4, type: 'mcq' });
const set = generateQuestions({ level: 6, type: 'short-answer', count: 5 });
```

## Dữ liệu đầu ra

```javascript
{
  id,
  grade,
  topicId,
  topicName,
  level,
  levelName,
  type,
  question,
  choices,
  correctIndex,
  answer,
  explanation,
  answerLines,
  tags,
  difficulty
}
```

`explanation` là mảng các bước giải ngắn để đưa vào `dapan_x.pdf`. `answerLines` là số dòng gợi ý dành cho câu tự luận trong `deso_x.pdf`.

## Kiểm thử

Trong thư mục, chạy:

```bash
node test.mjs
```

Bộ test sinh 7.000 câu thử và kiểm tra cấu trúc, số lựa chọn, đáp án đúng và khả năng sinh nhiều câu không trùng nhau.
