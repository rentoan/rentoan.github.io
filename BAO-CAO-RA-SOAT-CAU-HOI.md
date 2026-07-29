# Báo cáo rà soát hệ thống sinh câu hỏi

Phạm vi kiểm tra:

- Trang luyện tập: Chương 3, 4, 5.
- Bộ sinh đề: Chương 1, 2, 3, 4, 5.
- Kiểm tra cấu trúc câu hỏi, đáp án trắc nghiệm, đáp án tự luận, tính duy nhất của phương án và một số điều kiện toán học của dữ kiện.

## Lỗi đã phát hiện và sửa

1. Chương 4, bộ sinh đề, mức tỉ số:
   - Đề yêu cầu rút gọn tỉ số nhưng đáp án đôi khi chưa tối giản.
   - Đã sửa bằng cách chia cho ước chung lớn nhất.

2. Chương 4, tính chất đường phân giác:
   - Một mẫu sinh độ dài có thể tạo tam giác suy biến hoặc không tồn tại.
   - Đã đổi cách sinh dữ kiện để vừa đúng tỉ lệ đường phân giác, vừa bảo đảm bất đẳng thức tam giác.

3. Chương 5, biểu đồ đoạn thẳng:
   - Câu hỏi “tháng nào lớn nhất” đôi khi có hai tháng đồng hạng nhưng hệ thống chỉ nhận một đáp án.
   - Đã buộc dữ liệu có một giá trị lớn nhất duy nhất.

4. Chương 5, phân tích dữ liệu:
   - Câu hỏi “lớp nào lớn nhất” đôi khi có hai lớp đồng hạng.
   - Đã buộc dữ liệu có một giá trị lớn nhất duy nhất.

## Kiểm thử tự động

- Trang luyện tập Chương 3, 4, 5: 35.000 câu mỗi chương.
- Bộ sinh đề Chương 1 đến 5: 70.000 câu mỗi chương, gồm 7 mức và 2 loại câu.
- Kiểm tra:
  - câu hỏi có đủ trường dữ liệu;
  - trắc nghiệm có đúng 4 lựa chọn khác nhau;
  - đáp án đúng luôn nằm trong lựa chọn;
  - `correctIndex` trỏ đúng đáp án;
  - generator không phát sinh lỗi khi chạy hàng loạt.

## Giới hạn của lần rà soát này

Bản vá dựa trên gói mã nguồn gần nhất trong cuộc trò chuyện. Nếu repository GitHub hiện tại đã được sửa thêm sau khi tải gói này, cần đối chiếu hoặc gửi bản ZIP mới nhất của toàn bộ repository để kiểm tra chính xác tuyệt đối.
