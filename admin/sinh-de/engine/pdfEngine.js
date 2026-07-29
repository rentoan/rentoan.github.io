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
    const canvas = await html2canvas(paper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const pxPerMm = canvas.width / usableWidth;
    const pageSlicePx = Math.floor((pageHeight - margin * 2) * pxPerMm);

    let offsetY = 0;
    let page = 0;
    while (offsetY < canvas.height) {
      const sliceHeight = Math.min(pageSlicePx, canvas.height - offsetY);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      slice.getContext('2d').drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const imgData = slice.toDataURL('image/jpeg', 0.94);
      const imageHeightMm = sliceHeight / pxPerMm;
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, imageHeightMm, undefined, 'FAST');
      page += 1;
      offsetY += sliceHeight;
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
