import { formatExamNumber } from './examGenerator.js';
import { renderAnswerHtml, renderExamHtml } from './preview.js';

function requirePdfLibraries() {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF || typeof window.html2canvas !== 'function') {
    throw new Error('Chưa tải được thư viện xuất PDF. Hãy kiểm tra kết nối Internet rồi thử lại.');
  }
  return { jsPDF, html2canvas: window.html2canvas };
}

async function waitForPaint() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (document.fonts?.ready) await document.fonts.ready;
}

/**
 * Lấy vị trí các khối không nên bị cắt đôi khi chia trang PDF.
 * Tọa độ được đổi từ CSS pixel sang pixel thực của canvas html2canvas.
 */
function collectKeepTogetherRanges(paper, canvas) {
  const paperRect = paper.getBoundingClientRect();
  const scaleY = canvas.height / paperRect.height;
  const selectors = [
    '.paper-header',
    '.question-block',
    '.answer-block',
    '.paper-footer'
  ].join(',');

  return [...paper.querySelectorAll(selectors)]
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: Math.max(0, Math.round((rect.top - paperRect.top) * scaleY)),
        bottom: Math.min(canvas.height, Math.ceil((rect.bottom - paperRect.top) * scaleY))
      };
    })
    .filter((range) => range.bottom > range.top)
    .sort((a, b) => a.top - b.top);
}

/**
 * Chọn điểm cắt trang gần với chiều cao A4 nhưng lùi lên trước một câu hỏi/
 * lời giải nếu điểm cắt dự kiến đang đi xuyên qua khối đó.
 */
function choosePageEnd(offsetY, desiredEnd, maxSliceHeight, ranges, canvasHeight) {
  let pageEnd = Math.min(desiredEnd, canvasHeight);

  const crossedRange = ranges.find((range) => (
    range.top > offsetY + 4 &&
    range.top < pageEnd &&
    range.bottom > pageEnd
  ));

  if (crossedRange) {
    const blockHeight = crossedRange.bottom - crossedRange.top;
    const contentBeforeBlock = crossedRange.top - offsetY;

    // Chỉ lùi điểm cắt khi khối có thể nằm trọn trên một trang và trang hiện
    // tại không bị rỗng. Khối quá cao vẫn phải được cắt theo chiều cao A4.
    if (blockHeight <= maxSliceHeight && contentBeforeBlock >= 80) {
      pageEnd = crossedRange.top;
    }
  }

  // Chốt an toàn để vòng lặp luôn tiến về phía trước.
  if (pageEnd <= offsetY + 4) {
    pageEnd = Math.min(offsetY + maxSliceHeight, canvasHeight);
  }

  return pageEnd;
}

async function htmlToPdf(html, filename) {
  const { jsPDF, html2canvas } = requirePdfLibraries();
  const staging = document.createElement('div');
  staging.className = 'pdf-staging';
  staging.innerHTML = html;
  document.body.appendChild(staging);
  await waitForPaint();

  try {
    const paper = staging.querySelector('.paper');
    if (!paper) throw new Error('Không tìm thấy nội dung đề để xuất PDF.');

    const canvas = await html2canvas(paper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const pxPerMm = canvas.width / usableWidth;
    const maxSliceHeight = Math.floor(usableHeight * pxPerMm);
    const keepTogetherRanges = collectKeepTogetherRanges(paper, canvas);

    let offsetY = 0;
    let page = 0;

    while (offsetY < canvas.height) {
      const desiredEnd = Math.min(offsetY + maxSliceHeight, canvas.height);
      const pageEnd = choosePageEnd(
        offsetY,
        desiredEnd,
        maxSliceHeight,
        keepTogetherRanges,
        canvas.height
      );
      const sliceHeight = pageEnd - offsetY;

      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const context = slice.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const imgData = slice.toDataURL('image/jpeg', 0.94);
      const imageHeightMm = sliceHeight / pxPerMm;
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, imageHeightMm, undefined, 'FAST');

      page += 1;
      offsetY = pageEnd;
    }

    pdf.save(filename);
  } finally {
    staging.remove();
  }
}

export async function downloadExamPdf(exam) {
  return htmlToPdf(renderExamHtml(exam), `deso_${formatExamNumber(exam.examNumber)}.pdf`);
}

export async function downloadAnswerPdf(exam) {
  return htmlToPdf(renderAnswerHtml(exam), `dapan_${formatExamNumber(exam.examNumber)}.pdf`);
}

export async function downloadBothPdfs(exam, onProgress = null) {
  onProgress?.('Đang tạo đề PDF...');
  await downloadExamPdf(exam);
  onProgress?.('Đang tạo đáp án PDF...');
  await downloadAnswerPdf(exam);
  onProgress?.('Đã tạo xong hai tệp PDF.');
}
