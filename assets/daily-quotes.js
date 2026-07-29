(() => {
  "use strict";

  // Các câu được viết riêng cho RenToan để tránh gán sai nguồn cho người nổi tiếng.
  // Mỗi ngày toàn bộ học sinh sẽ nhìn thấy cùng một câu; sang ngày mới câu tự đổi.
  const quotes = [
    "Mỗi bước luyện tập hôm nay đang âm thầm xây nền cho ngày mai.",
    "Đi xa không bắt đầu bằng một bước thật lớn, mà bằng những bước nhỏ không bị bỏ quên.",
    "Kiến thức trở thành năng lực khi em dùng nó đủ nhiều lần.",
    "Một bài làm chưa đúng vẫn có giá trị, nếu em tìm được điều cần sửa.",
    "Học đều mỗi ngày giúp điều khó hôm qua trở thành điều quen thuộc ngày mai.",
    "Nền tảng vững chắc được xây từ những việc nhỏ được làm cẩn thận và lặp lại.",
    "Tiến bộ không phải lúc nào cũng ồn ào; đôi khi nó chỉ là hôm nay em hiểu hơn hôm qua một chút.",
    "Đừng vội đếm mình đã học bao nhiêu; hãy xem điều gì đã trở thành của mình.",
    "Mỗi lần tự giải được một bài là một lần tư duy của em lớn thêm.",
    "Luyện tập tốt không chỉ lặp lại đáp án, mà còn hiểu vì sao mình làm như vậy.",
    "Sự tự tin thật sự được tạo nên từ những lần tự mình vượt qua khó khăn.",
    "Không cần giỏi ngay hôm nay; cần bền bỉ để ngày mai giỏi hơn.",
    "Một ngày học ít nhưng thật chắc có thể giá trị hơn một ngày học thật nhiều rồi quên.",
    "Sai một bài không làm em kém đi; bỏ qua điều mình chưa hiểu mới khiến khoảng trống ở lại.",
    "Khi em kiên trì với điều cơ bản, điều nâng cao sẽ có chỗ để bén rễ.",
    "Thói quen học tập tốt là chiếc cầu nối giữa mục tiêu và năng lực.",
    "Mỗi bài tập là một viên gạch; sự đều đặn biến những viên gạch thành nền móng.",
    "Học không ngừng không có nghĩa là luôn học thật nhiều, mà là không ngừng tiến về phía trước.",
    "Điều em làm lặp lại mỗi ngày rồi sẽ trở thành một phần năng lực của em.",
    "Đừng sợ bước chậm; hãy giữ cho bước chân của mình không dừng lại.",
    "Hiểu sâu được tạo nên từ nhiều lần quan sát, thử sức, sai và sửa.",
    "Bài toán khó là nơi những điều cơ bản được gọi đến làm việc cùng nhau.",
    "Kỷ luật nhỏ mỗi ngày có thể mở ra những khả năng rất lớn về sau.",
    "Hôm nay em chăm sóc nền tảng; ngày mai nền tảng ấy sẽ nâng đỡ em."
  ];

  function getLocalDayNumber(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((today - startOfYear) / 86400000);
  }

  function showDailyQuote() {
    const quoteElement = document.getElementById("dailyQuote");
    const noteElement = document.getElementById("dailyQuoteNote");
    if (!quoteElement) return;

    const index = getLocalDayNumber() % quotes.length;
    quoteElement.textContent = `“${quotes[index]}”`;

    if (noteElement) {
      noteElement.textContent = "Lời nhắc hôm nay · RenToan";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showDailyQuote, { once: true });
  } else {
    showDailyQuote();
  }
})();
