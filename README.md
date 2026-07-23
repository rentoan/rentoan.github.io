# Rèn Toán · Giai đoạn 1

Website GitHub Pages có Firebase Authentication và Cloud Firestore.

## Tính năng đã có

- Đăng nhập bằng tên người dùng và mật khẩu được cấp thủ công.
- Không cho mở trang học khi chưa đăng nhập.
- Kiểm tra tài khoản `active` và quyền lớp trong `allowedGrades`.
- Có thể giới hạn thêm từng chủ đề bằng `allowedTopics`.
- Lưu số câu đã làm, số câu đúng theo ngày, chủ đề và mức luyện.
- Trang `tien-do.html` hiển thị tiến độ của người học.
- Tiến độ đi theo tài khoản, dùng được trên nhiều thiết bị.

## 1. Bật Authentication

Trong Firebase Console:

1. **Security → Authentication → Get started**.
2. **Sign-in method → Email/Password → Enable → Save**.
3. Mở **Settings → Authorized domains** và thêm tên miền GitHub Pages, ví dụ `habelle.github.io`.

## 2. Tạo Firestore

1. **Build → Firestore Database → Create database**.
2. Chọn **Production mode**.
3. Mở thẻ **Rules**.
4. Sao chép toàn bộ nội dung file `firestore/firestore.rules`, dán vào và bấm **Publish**.

## 3. Tạo tài khoản thủ công

Trong **Authentication → Users → Add user**:

- Email kỹ thuật: `user01@rentoan.local`
- Mật khẩu: mật khẩu bạn muốn cấp

Học sinh chỉ cần nhập `user01`; website tự nối `@rentoan.local`.

> Mỗi username phải viết thường và chỉ dùng chữ, số, dấu chấm, `_` hoặc `-`.

## 4. Tạo hồ sơ và cấp quyền

Sau khi tạo tài khoản, sao chép **User UID** trong Authentication.

Trong Firestore:

1. Tạo collection `users`.
2. Tạo document có **Document ID đúng bằng UID**.
3. Thêm các field:

| Field | Type | Ví dụ |
|---|---|---|
| `username` | string | `user01` |
| `displayName` | string | `Nguyễn Minh An` |
| `role` | string | `student` |
| `active` | boolean | `true` |
| `allowedGrades` | array | số `8` |
| `allowedTopics` | array | chuỗi `lop8-chude1` |

Mẫu dữ liệu nằm trong `firestore/user-profile-example.json`.

### Quy tắc quyền

- `allowedGrades: [8]`: được vào trang Toán 8.
- Không tạo `allowedTopics` hoặc để mảng rỗng: được vào mọi chủ đề đang mở trong lớp đã cấp.
- `allowedTopics: ["lop8-chude1"]`: chỉ được vào Chủ đề 1 của Toán 8.
- `active: false`: khóa tài khoản ngay lần truy cập tiếp theo.

## 5. Đưa lên GitHub Pages

Tải toàn bộ nội dung bên trong thư mục này lên thư mục gốc repository. Thư mục gốc phải có:

```text
index.html
login.html
tien-do.html
khong-co-quyen.html
assets/
lop-8/
firestore/
```

Vào **Settings → Pages → Deploy from a branch → main → /(root)**.

## 6. Kiểm tra

1. Mở website ở cửa sổ ẩn danh.
2. Trang phải tự chuyển tới `login.html`.
3. Đăng nhập bằng `user01` và mật khẩu đã cấp.
4. Mở Toán 8, làm một câu rồi nộp.
5. Kiểm tra `users/{UID}/progress` trong Firestore.
6. Mở `tien-do.html` để xem số liệu.

## Cấu trúc tiến độ

Firestore tự tạo các document:

```text
users/{UID}/progress/summary
users/{UID}/progress/day-YYYY-MM-DD
users/{UID}/progress/lop8-chude1
users/{UID}/progress/lop8-chude1-level-1
```

Mỗi document lưu `attempted`, `correct` và `updatedAt`.

## Lưu ý

- Không cần Firebase Hosting. Website vẫn chạy trên GitHub Pages.
- Firebase config phía Web không phải private key. Bảo vệ dữ liệu nằm ở Authentication và Firestore Rules.
- Giai đoạn này giáo viên tạo tài khoản, hồ sơ và quyền trực tiếp trong Firebase Console.
