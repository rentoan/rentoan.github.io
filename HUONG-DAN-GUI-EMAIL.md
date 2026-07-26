# Hướng dẫn bật email báo cáo phụ huynh

Phần website vẫn chạy trên GitHub Pages. Việc tự gửi email lúc 21:00 cần Cloud Functions và Cloud Scheduler của Firebase.

## A. Chuẩn bị

### 1. Nâng Firebase lên Blaze

Trong Firebase Console, bấm `Upgrade` ở góc dưới bên trái và chọn Blaze. Cloud Functions theo lịch cần tài khoản thanh toán. Với quy mô ít người học, lưu lượng thường rất nhỏ, nhưng bạn nên đặt cảnh báo ngân sách trong Google Cloud Billing.

### 2. Chuẩn bị SMTP

Bạn cần một hộp thư hoặc dịch vụ cho phép gửi SMTP.

Cấu hình cần có:

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "user": "smtp-user",
  "pass": "smtp-password-or-api-key",
  "from": "RenToan <baocao@example.com>",
  "replyTo": "giaovien@example.com"
}
```

Không đưa mật khẩu SMTP vào GitHub.

### Dùng Gmail

Gmail thường dùng:

```json
{
  "host": "smtp.gmail.com",
  "port": 465,
  "secure": true,
  "user": "diachi@gmail.com",
  "pass": "MAT_KHAU_UNG_DUNG_16_KY_TU",
  "from": "RenToan <diachi@gmail.com>",
  "replyTo": "diachi@gmail.com"
}
```

Trường `pass` phải là App Password, không phải mật khẩu Google thông thường. Tài khoản Google cần bật xác minh hai bước để tạo App Password.

## B. Triển khai bằng Windows

Mở PowerShell tại thư mục `rentoan-v1.1`.

### 1. Cài Node.js

Cài Node.js 20 hoặc mới hơn từ trang chính thức của Node.js.

Kiểm tra:

```powershell
node -v
npm -v
```

### 2. Cài Firebase CLI

```powershell
npm install -g firebase-tools
```

Đăng nhập:

```powershell
firebase login
```

Kiểm tra project:

```powershell
firebase use rentoan-53cbe
```

### 3. Cài thư viện cho Function

```powershell
cd functions
npm install
cd ..
```

### 4. Tạo secret SMTP_CONFIG

Chạy:

```powershell
firebase functions:secrets:set SMTP_CONFIG
```

Khi Firebase hỏi giá trị, dán nguyên JSON trên một dòng. Ví dụ Gmail:

```json
{"host":"smtp.gmail.com","port":465,"secure":true,"user":"diachi@gmail.com","pass":"APP_PASSWORD","from":"RenToan <diachi@gmail.com>","replyTo":"diachi@gmail.com"}
```

### 5. Triển khai

```powershell
firebase deploy --only functions
```

Sau khi thành công, Firebase sẽ tạo Function:

```text
sendDailyParentReports
```

và Cloud Scheduler chạy lúc 21:00 theo giờ Việt Nam.

## C. Cấp email phụ huynh

Trong Firestore, mở:

```text
users/{UID}
```

Thêm hoặc sửa:

```text
parentEmail          String    phuhuynh@example.com
emailReportEnabled   Boolean   true
```

Nếu một phụ huynh quản lý hai người học, có thể dùng cùng một email cho cả hai. Hệ thống gửi hai báo cáo riêng.

## D. Kiểm tra sau khi chạy

Sau 21:00, mở Firestore và kiểm tra collection:

```text
emailReports
```

Document thành công có:

```text
status: sent
attempted: ...
correct: ...
accuracy: ...
sentAt: ...
```

Document lỗi có:

```text
status: failed
error: ...
```

Xem log bằng:

```powershell
firebase functions:log
```

## E. Các lỗi thường gặp

### Không gửi email

Kiểm tra:

- `emailReportEnabled` là Boolean `true`.
- `parentEmail` không rỗng.
- tài khoản có `active = true`.
- SMTP_CONFIG đúng.
- Gmail dùng App Password.
- Function đã triển khai thành công.

### Gửi trùng

Function dùng document `emailReports/YYYY-MM-DD_UID` để tránh gửi lặp. Không nên tự xóa document của ngày hiện tại khi Scheduler có thể còn chạy lại.

### Học sinh không làm bài mà vẫn nhận thư

Đây là hành vi đã thiết kế. Email sẽ thông báo chưa ghi nhận hoạt động trong ngày.
