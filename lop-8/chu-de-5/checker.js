function normalize(value) { return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ").replace(/,/g, "."); }
function numeric(value) { const s=normalize(value).replace(/%|°|học sinh|bạn|lần|phiếu/g, "").trim(); if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s); const m=s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/); return m&&Number(m[2])!==0?Number(m[1])/Number(m[2]):NaN; }
export function equivalent(user, question) {
  const u=normalize(user), answers=(question.acceptedAnswers||[question.answer]).map(normalize);
  if (answers.includes(u)) return true;
  const un=numeric(u); return Number.isFinite(un) && answers.some(a=>{const n=numeric(a);return Number.isFinite(n)&&Math.abs(n-un)<1e-9;});
}
export function diagnose(){ return "Em hãy đọc lại dữ liệu, đơn vị và phép tính cần dùng."; }
export function pretty(value){ return String(value ?? ""); }
