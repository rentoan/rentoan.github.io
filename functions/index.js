const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineJsonSecret, defineString } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");

initializeApp();
const db = getFirestore();

const SMTP_CONFIG = defineJsonSecret("SMTP_CONFIG");
const REPORT_SITE_URL = defineString("REPORT_SITE_URL", {
  default: "https://rentoan.github.io/"
});

const TOPIC_NAMES = {
  "lop8-chude1": "Biến đổi biểu thức đại số"
};

function dateKeyInVietnam(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function displayDate(dateKey) {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

function percent(correct = 0, attempted = 0) {
  return attempted ? Math.round((correct / attempted) * 100) : 0;
}

function learningComment(attempted, rate) {
  if (!attempted) return "Hôm nay chưa ghi nhận hoạt động luyện tập.";
  if (attempted >= 15 && rate >= 85) return "Em đã có một buổi luyện tập tích cực và đạt độ chính xác tốt.";
  if (rate >= 70) return "Em đã luyện tập trong ngày và đang tiến bộ ổn định.";
  return "Em đã có luyện tập, nhưng nên xem lại phần giải thích và làm thêm các câu cùng mức.";
}

function buildReport({ profile, daily, dateKey }) {
  const attempted = Number(daily.attempted || 0);
  const correct = Number(daily.correct || 0);
  const rate = percent(correct, attempted);
  const topicName = TOPIC_NAMES[daily.lastTopicId] || daily.lastTopicId || "Chưa có";
  const levelText = daily.lastLevel ? `Mức ${daily.lastLevel}` : "Chưa có";
  const name = profile.displayName || profile.username || "Người học";
  const comment = learningComment(attempted, rate);
  const dateText = displayDate(dateKey);

  const subject = `Báo cáo RenToan ngày ${dateText} – ${name}`;
  const text = [
    `Kính gửi phụ huynh,`,
    ``,
    `Kết quả luyện tập RenToan ngày ${dateText} của ${name}:`,
    `- Số câu đã làm: ${attempted}`,
    `- Số câu đúng: ${correct}`,
    `- Tỉ lệ chính xác: ${rate}%`,
    `- Chủ đề gần nhất: ${topicName}`,
    `- Mức luyện gần nhất: ${levelText}`,
    ``,
    `Nhận xét: ${comment}`,
    ``,
    `Xem RenToan: ${REPORT_SITE_URL.value()}`,
    ``,
    `Đây là email tự động từ RenToan.`
  ].join("\n");

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#243047;max-width:620px;margin:auto">
    <h2 style="color:#1f5fd1">Báo cáo học tập RenToan</h2>
    <p>Kính gửi phụ huynh,</p>
    <p>Kết quả luyện tập ngày <strong>${dateText}</strong> của <strong>${escapeHtml(name)}</strong>:</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0">
      <tr><td style="padding:9px;border-bottom:1px solid #e5e9f0">Số câu đã làm</td><td style="padding:9px;border-bottom:1px solid #e5e9f0;text-align:right"><strong>${attempted}</strong></td></tr>
      <tr><td style="padding:9px;border-bottom:1px solid #e5e9f0">Số câu đúng</td><td style="padding:9px;border-bottom:1px solid #e5e9f0;text-align:right"><strong>${correct}</strong></td></tr>
      <tr><td style="padding:9px;border-bottom:1px solid #e5e9f0">Tỉ lệ chính xác</td><td style="padding:9px;border-bottom:1px solid #e5e9f0;text-align:right"><strong>${rate}%</strong></td></tr>
      <tr><td style="padding:9px;border-bottom:1px solid #e5e9f0">Chủ đề gần nhất</td><td style="padding:9px;border-bottom:1px solid #e5e9f0;text-align:right">${escapeHtml(topicName)}</td></tr>
      <tr><td style="padding:9px;border-bottom:1px solid #e5e9f0">Mức luyện gần nhất</td><td style="padding:9px;border-bottom:1px solid #e5e9f0;text-align:right">${escapeHtml(levelText)}</td></tr>
    </table>
    <p><strong>Nhận xét:</strong> ${escapeHtml(comment)}</p>
    <p><a href="${REPORT_SITE_URL.value()}" style="display:inline-block;padding:10px 16px;background:#1f5fd1;color:white;text-decoration:none;border-radius:8px">Mở RenToan</a></p>
    <p style="font-size:12px;color:#6d7788;margin-top:28px">Đây là email tự động từ RenToan.</p>
  </div>`;

  return { subject, text, html, attempted, correct, rate };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function createTransport() {
  const config = SMTP_CONFIG.value();
  if (!config.host || !config.user || !config.pass || !config.from) {
    throw new Error("SMTP_CONFIG thiếu host, user, pass hoặc from.");
  }
  return {
    transporter: nodemailer.createTransport({
      host: config.host,
      port: Number(config.port || 587),
      secure: Boolean(config.secure),
      auth: { user: config.user, pass: config.pass }
    }),
    from: config.from,
    replyTo: config.replyTo || undefined
  };
}

exports.sendDailyParentReports = onSchedule({
  schedule: "0 21 * * *",
  timeZone: "Asia/Ho_Chi_Minh",
  region: "asia-southeast1",
  timeoutSeconds: 540,
  memory: "256MiB",
  secrets: [SMTP_CONFIG]
}, async () => {
  const dateKey = dateKeyInVietnam();
  const { transporter, from, replyTo } = createTransport();
  const usersSnapshot = await db.collection("users")
    .where("emailReportEnabled", "==", true)
    .get();

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const userDoc of usersSnapshot.docs) {
    const profile = userDoc.data();
    const parentEmail = String(profile.parentEmail || "").trim();
    const reportId = `${dateKey}_${userDoc.id}`;
    const reportRef = db.collection("emailReports").doc(reportId);

    if (!profile.active || !parentEmail) {
      skipped += 1;
      continue;
    }
    if ((await reportRef.get()).exists) {
      skipped += 1;
      continue;
    }

    try {
      const dailySnapshot = await userDoc.ref.collection("progress").doc(`day-${dateKey}`).get();
      const daily = dailySnapshot.exists ? dailySnapshot.data() : {};
      const report = buildReport({ profile, daily, dateKey });

      await transporter.sendMail({
        from,
        to: parentEmail,
        replyTo,
        subject: report.subject,
        text: report.text,
        html: report.html
      });

      await reportRef.set({
        userId: userDoc.id,
        username: profile.username || "",
        date: dateKey,
        recipient: parentEmail,
        attempted: report.attempted,
        correct: report.correct,
        accuracy: report.rate,
        status: "sent",
        sentAt: FieldValue.serverTimestamp()
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      logger.error("Không gửi được báo cáo", {
        userId: userDoc.id,
        date: dateKey,
        message: error.message
      });
      await reportRef.set({
        userId: userDoc.id,
        username: profile.username || "",
        date: dateKey,
        status: "failed",
        error: String(error.message || error).slice(0, 500),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
  }

  logger.info("Hoàn thành báo cáo RenToan", {
    date: dateKey,
    users: usersSnapshot.size,
    sent,
    skipped,
    failed
  });
});
