# RenToan v1.3 – Trang quản trị học sinh

## Cập nhật

- Thêm `admin/`: danh sách tài khoản, tìm kiếm, cấp quyền Toán 8/Chủ đề 1/Chủ đề 2.
- Sửa họ tên, email phụ huynh, trạng thái tài khoản và bật/tắt email báo cáo.
- Xem nhanh số câu và độ chính xác trong ngày.
- Tài khoản có `role: teacher` tự thấy nút **Quản trị**.
- Bổ sung Chủ đề 2 vào bản v1.1.

## Việc bắt buộc sau khi tải lên GitHub

1. Mở `firestore/firestore.rules`, sao chép toàn bộ vào Firestore → Rules → Publish.
2. Trong Firestore, đặt tài khoản quản trị đầu tiên có trường `role` bằng `teacher`.
3. Đăng xuất rồi đăng nhập lại để nút **Quản trị** xuất hiện.

> Trang Admin không tạo tài khoản Authentication mới. Tài khoản học sinh vẫn được tạo trong Firebase Authentication, sau đó hồ sơ Firestore tự sinh khi đăng nhập lần đầu.
