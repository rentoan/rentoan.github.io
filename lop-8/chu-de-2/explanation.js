export function commonFactorExplanation({ expression, factor, inside, coefficientGcd, variablePart, note = "" }) {
  const steps = [];
  if (coefficientGcd) steps.push(`ƯCLN của các hệ số là ${coefficientGcd}.`);
  if (variablePart) steps.push(`Phần biến chung là ${variablePart}.`);
  steps.push(`Đặt ${factor} ra ngoài ngoặc: ${expression} = ${factor}(${inside}).`);
  if (note) steps.push(note);
  return steps.join(" ");
}

export function polynomialFactorExplanation({ expression, factor, inside }) {
  return `Biểu thức ${factor} xuất hiện trong mọi hạng tử. Xem ${factor} như một khối chung rồi đặt ra ngoài: ${expression} = ${factor}(${inside}).`;
}

export function recognitionExplanation(factor, expression) {
  return `Trong ${expression}, ${factor} là nhân tử xuất hiện ở tất cả các hạng tử và là nhân tử chung lớn nhất trong các lựa chọn.`;
}
