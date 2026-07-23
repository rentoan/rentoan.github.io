# RenToan v1.0

Website luyện Toán tĩnh chạy trên GitHub Pages, sử dụng Firebase Authentication để đăng nhập và Cloud Firestore để lưu tiến độ.

## Chức năng Giai đoạn 1

- Đăng nhập bằng tên người dùng và mật khẩu do giáo viên cấp.
- Phân quyền theo lớp (`allowedGrades`) và chủ đề (`allowedTopics`).
- Toán 8, Chủ đề 1: Biến đổi biểu thức đại số, gồm 7 mức luyện.
- Ghi số câu đã làm, số câu đúng theo ngày, chủ đề và mức luyện.
- Trang tiến độ cá nhân và gợi ý mức cần luyện lại.
- Không có chức năng tự đăng ký tài khoản.

## 1. Đưa website lên GitHub Pages

Tải toàn bộ nội dung thư mục này vào thư mục gốc repository `rentoan.github.io`:

```
index.html
login.html
tien-do.html
khong-co-quyen.html
.nojekyll
assets/
core/
firestore/
lop-8/
```

Trong GitHub: `Settings → Pages → Deploy from a branch → main → /(root)`.

## 2. Bật Authentication

Trong Firebase Console:

1. `Security → Authentication`.
2. `Sign-in method`.
3. Bật `Email/Password`.
4. Trong `Settings → Authorized domains`, thêm `rentoan.github.io`.

## 3. Tạo Firestore và cài Rules

1. Tạo Firestore Database.
2. Mở tab `Rules`.
3. Sao chép toàn bộ nội dung `firestore/firestore.rules`.
4. Bấm `Publish`.

Rules cho phép người học đọc hồ sơ của chính mình và chỉ tăng bộ đếm tiến độ mỗi lần một câu. Người học không thể tự sửa hồ sơ quyền truy cập.

## 4. Tạo tài khoản bằng tay

Trong `Authentication → Users → Add user`:

- Email kỹ thuật: `user01@rentoan.local`
- Password: mật khẩu bạn cấp

Người học chỉ nhập `user01` ở màn hình đăng nhập. Website tự nối phần `@rentoan.local`.

Sau khi tạo, sao chép UID của người dùng.

## 5. Tạo hồ sơ quyền trong Firestore

Tạo collection `users`, sau đó tạo document có Document ID đúng bằng UID của tài khoản Authentication.

Thêm các trường:

| Field | Type | Ví dụ |
|---|---|---|
| username | string | user01 |
| displayName | string | Nguyễn Minh An |
| role | string | student |
| active | boolean | true |
| allowedGrades | array | 8 (number) |
| allowedTopics | array | lop8-chude1 (string) |

Mẫu nằm trong `firestore/user-profile-example.json`.

### Quy tắc cấp quyền

- `allowedGrades: [8]`: được vào Toán 8.
- `allowedTopics: ["lop8-chude1"]`: chỉ được vào Chủ đề 1.
- `allowedTopics: []`: được vào tất cả chủ đề đang mở của lớp đã cấp.
- `active: false`: khóa tài khoản.

## 6. Kiểm tra

1. Mở `https://rentoan.github.io/login.html`.
2. Đăng nhập bằng `user01` và mật khẩu đã tạo.
3. Làm một câu.
4. Mở Firestore: `users/{UID}/progress` để thấy các document:
   - `summary`
   - `day-YYYY-MM-DD`
   - `lop8-chude1`
   - `lop8-chude1-level-1` ...

## Lưu ý

- Cấu hình Firebase phía web không phải private key. Bảo vệ dữ liệu nằm ở Authentication và Firestore Rules.
- Giai đoạn 1 chưa có trang quản trị. Tài khoản và quyền được quản lý trực tiếp trong Firebase Console.
- Không xóa hoặc cho phép học sinh sửa document `users/{UID}`.
