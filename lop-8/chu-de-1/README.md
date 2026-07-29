# RenToan v1.4 - Generator Chủ đề 1

## Chủ đề

**Biến đổi biểu thức đại số - Toán 8**

## Tệp cần cập nhật

Đặt `generator.js` tại:

```text
lop-8/chu-de-1/generator.js
```

Hoặc đặt trong thư mục generator dùng chung của module sinh đề, sau đó import bằng đường dẫn phù hợp.

## Ví dụ sử dụng

```javascript
import {
  topicInfo,
  generateQuestion,
  generateQuestions
} from './generator.js';

const oneQuestion = generateQuestion({
  level: 2,
  type: 'mcq'
});

const exerciseQuestions = generateQuestions({
  level: 4,
  type: 'short-answer',
  count: 5
});
```

## Các mức luyện

1. Thu gọn các hạng tử đồng dạng.
2. Bỏ ngoặc và đổi dấu.
3. Sử dụng tính chất phân phối.
4. Thu gọn biểu thức nhiều bước.
5. Nhân đa thức.
6. Hằng đẳng thức đáng nhớ.
7. Biến đổi tổng hợp.

## Cấu trúc dữ liệu đầu ra

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

`explanation` là mảng các bước giải thích ngắn, dùng được cho file đáp án PDF.
