# RenToan v1.3

> Bản này giữ nguyên v1.1, bổ sung Chủ đề 2 và trang quản trị học sinh. Xem `README-V1.3.md` để cập nhật.

# RenToan v1.1

Website luyện Toán theo chủ đề, chạy giao diện trên GitHub Pages và dùng Firebase cho đăng nhập, tiến độ và email báo cáo phụ huynh.

## Những gì đã có trong v1.1

- Đăng nhập bằng tên người dùng và mật khẩu do giáo viên cấp.
- Tự tạo hồ sơ Firestore ở lần đăng nhập đầu tiên nếu tài khoản mới chỉ tồn tại trong Authentication.
- Tài khoản mới ở trạng thái chờ cấp quyền, không còn báo lỗi “chưa có hồ sơ học tập”.
- Phân quyền theo lớp và theo chủ đề.
- Lưu số câu đã làm, số câu đúng theo ngày, chủ đề và mức luyện.
- Trang tiến độ cá nhân và gợi ý mức cần luyện thêm.
- Cloud Function gửi email phụ huynh lúc 21:00 hằng ngày, múi giờ Việt Nam.
- Email vẫn được gửi khi học sinh không làm câu nào trong ngày.
- Chống gửi lặp bằng collection `emailReports`.

## Cấu trúc chính

```text
rentoan-v1.1/
├── index.html
├── login.html
├── tien-do.html
├── assets/
├── core/
├── lop-8/
├── firestore/
├── functions/               # Cloud Function gửi email
├── firebase.json
├── .firebaserc
└── .nojekyll
```

## 1. Cập nhật GitHub Pages

Tải toàn bộ nội dung bên trong thư mục này lên thư mục gốc của repository `rentoan.github.io`.

Các file quan trọng phải nằm ngay ngoài cùng:

```text
index.html
login.html
assets/
core/
lop-8/
```

Thư mục `functions/` không chạy trên GitHub Pages. Nó được giữ cùng repository để quản lý mã nguồn, nhưng phải triển khai riêng lên Firebase.

## 2. Cập nhật Firestore Rules

Mở file:

```text
firestore/firestore.rules
```

Sao chép toàn bộ vào Firebase Console:

```text
Firestore → Rules → Publish
```

Rules mới cho phép một tài khoản đã đăng nhập tự tạo duy nhất hồ sơ ban đầu của chính mình với quyền rỗng. Người học không thể tự sửa quyền, email phụ huynh hoặc trạng thái tài khoản.

## 3. Luồng tạo tài khoản mới

Trong Firebase Authentication, tạo:

```text
user01@rentoan.local
```

Khi `user01` đăng nhập lần đầu, website tự tạo:

```text
users/{UID}
```

với dữ liệu ban đầu:

```json
{
  "username": "user01",
  "displayName": "user01",
  "role": "student",
  "active": true,
  "allowedGrades": [],
  "allowedTopics": [],
  "parentEmail": "",
  "emailReportEnabled": false
}
```

Sau đó giáo viên sửa hồ sơ trong Firestore Console:

```text
displayName: Nguyễn Minh An
allowedGrades: [8]
allowedTopics: ["lop8-chude1"]
parentEmail: email-phu-huynh@example.com
emailReportEnabled: true
```

Lưu ý:

- `8` trong `allowedGrades` là Number.
- `lop8-chude1` là String.
- Không để khoảng trắng thừa ở email phụ huynh.
- Đặt `emailReportEnabled = false` nếu tạm ngừng gửi báo cáo.

## 4. Dữ liệu email hằng ngày

Function đọc:

```text
users/{UID}
users/{UID}/progress/day-YYYY-MM-DD
```

Sau khi gửi thành công, Function ghi:

```text
emailReports/YYYY-MM-DD_UID
```

Nhờ đó một báo cáo không bị gửi lặp khi Cloud Scheduler thử chạy lại.

## 5. Triển khai Cloud Function

Xem hướng dẫn chi tiết tại:

```text
HUONG-DAN-GUI-EMAIL.md
```

Các điều kiện cần có:

- Firebase project nâng lên Blaze plan.
- Firebase CLI trên máy hoặc Google Cloud Shell.
- Một tài khoản SMTP, chẳng hạn Gmail App Password, Brevo, SendGrid hoặc nhà cung cấp SMTP khác.
- Secret `SMTP_CONFIG` đã được thiết lập.

## 6. Giờ gửi báo cáo

Function được đặt lịch:

```text
21:00 mỗi ngày
Múi giờ: Asia/Ho_Chi_Minh
```

Muốn đổi giờ, sửa trong `functions/index.js`:

```js
schedule: "0 21 * * *"
```

Ví dụ 20:30:

```js
schedule: "30 20 * * *"
```

## 7. Nội dung email

Email gồm:

- số câu đã làm trong ngày;
- số câu đúng;
- tỉ lệ chính xác;
- chủ đề gần nhất;
- mức luyện gần nhất;
- nhận xét tự động;
- đường dẫn tới RenToan.

Ngày không học vẫn gửi thông báo: “Hôm nay chưa ghi nhận hoạt động luyện tập.”
