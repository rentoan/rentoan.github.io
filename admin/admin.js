import { db } from "../core/firebase.js";
import { requireLogin, mountAccount, isTeacher, escapeHtml } from "../core/auth.js";
import { collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const session = await requireLogin("../login.html");
if (!session) throw new Error("Chưa đăng nhập.");
if (!isTeacher(session.profile)) { window.location.replace("../khong-co-quyen.html"); throw new Error("Không có quyền quản trị."); }
mountAccount(document.getElementById("accountArea"), session, { loginHref:"../login.html", progressHref:"../tien-do.html", adminHref:"./index.html" });

const listEl=document.getElementById("studentList"), statusEl=document.getElementById("statusMessage"), searchEl=document.getElementById("searchInput");
let records=[];
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const number=v=>Number.isFinite(Number(v))?Number(v):0;
const rate=(c,a)=>a?Math.round(c*100/a):0;

async function load(){
 statusEl.className="admin-message";statusEl.textContent="Đang tải danh sách…";listEl.innerHTML="";
 try{
  const snap=await getDocs(collection(db,"users"));
  records=await Promise.all(snap.docs.map(async userDoc=>{
   const [today,summary]=await Promise.all([
    getDoc(doc(db,"users",userDoc.id,"progress",`day-${dateKey()}`)),
    getDoc(doc(db,"users",userDoc.id,"progress","summary"))
   ]);
   return {id:userDoc.id,...userDoc.data(),today:today.exists()?today.data():{},summary:summary.exists()?summary.data():{}};
  }));
  records.sort((a,b)=>String(a.displayName||a.username).localeCompare(String(b.displayName||b.username),"vi"));
  render();
 }catch(e){statusEl.className="admin-message error";statusEl.textContent=`Không tải được dữ liệu: ${e.message}`;}
}
function checked(list,value){return Array.isArray(list)&&list.includes(value)?"checked":""}
function render(){
 const q=searchEl.value.trim().toLowerCase(); const shown=records.filter(r=>`${r.displayName||""} ${r.username||""}`.toLowerCase().includes(q));
 statusEl.textContent=`${shown.length} tài khoản${q?" phù hợp":""}.`;
 listEl.innerHTML=shown.map(r=>{const a=number(r.today.attempted),c=number(r.today.correct),total=number(r.summary.attempted);return `<article class="student-card ${r.role==="teacher"?"teacher-card":""}" data-id="${r.id}">
 <div class="student-head"><div class="student-title"><h2>${escapeHtml(r.displayName||r.username||"Chưa đặt tên")}</h2><p>${escapeHtml(r.username||"")} · ${r.role==="teacher"?"Giáo viên":"Học sinh"}</p></div><span class="badge ${r.active===true?"badge-open":"badge-locked"}">${r.active===true?"Đang hoạt động":"Đã khóa"}</span></div>
 <div class="student-stats"><div class="mini-stat"><strong>${a}</strong><span>Câu hôm nay</span></div><div class="mini-stat"><strong>${rate(c,a)}%</strong><span>Chính xác hôm nay</span></div><div class="mini-stat"><strong>${total}</strong><span>Tổng câu đã làm</span></div></div>
 <div class="admin-form"><div><div class="field"><label>Họ tên hiển thị</label><input data-field="displayName" value="${escapeHtml(r.displayName||"")}"></div><div class="field"><label>Email phụ huynh</label><input data-field="parentEmail" type="email" value="${escapeHtml(r.parentEmail||"")}" placeholder="phuhuynh@example.com"></div><div class="check-grid"><label class="check-item"><input data-field="active" type="checkbox" ${r.active===true?"checked":""}> Tài khoản hoạt động</label><label class="check-item"><input data-field="emailReportEnabled" type="checkbox" ${r.emailReportEnabled===true?"checked":""}> Gửi báo cáo hằng ngày</label></div></div>
 <div class="permission-box"><div class="permission-title">Quyền học</div><div class="check-grid"><label class="check-item"><input data-grade="8" type="checkbox" ${checked((r.allowedGrades||[]).map(Number),8)}> Toàn bộ Toán 8</label></div><hr style="border:0;border-top:1px solid var(--line);margin:14px 0"><div class="check-grid"><label class="check-item"><input data-topic="lop8-chude1" type="checkbox" ${checked(r.allowedTopics,"lop8-chude1")}> Chương 1 · Đa thức</label><label class="check-item"><input data-topic="lop8-chude2" type="checkbox" ${checked(r.allowedTopics,"lop8-chude2")}> Chương 2 · Hằng đẳng thức</label><label class="check-item"><input data-topic="lop8-chude3" type="checkbox" ${checked(r.allowedTopics,"lop8-chude3")}> Chương 3 · Tứ giác</label><label class="check-item"><input data-topic="lop8-chude4" type="checkbox" ${checked(r.allowedTopics,"lop8-chude4")}> Chương 4 · Định lí Thalès</label><label class="check-item"><input data-topic="lop8-chude5" type="checkbox" ${checked(r.allowedTopics,"lop8-chude5")}> Chương 5 · Dữ liệu và biểu đồ</label></div><p class="note" style="margin:14px 0 0">Chọn “Toàn bộ Toán 8” để tự mở mọi chương hiện tại và bổ sung sau này.</p></div></div>
 <div class="admin-actions"><span class="save-state"></span><button class="button button-primary save-button" type="button">Lưu thay đổi</button></div></article>`}).join("") || '<div class="empty">Không tìm thấy tài khoản phù hợp.</div>';
 listEl.querySelectorAll(".save-button").forEach(btn=>btn.addEventListener("click",()=>save(btn.closest(".student-card"))));
}
async function save(card){
 const id=card.dataset.id, state=card.querySelector(".save-state"), button=card.querySelector(".save-button");
 const displayName=card.querySelector('[data-field="displayName"]').value.trim();
 const parentEmail=card.querySelector('[data-field="parentEmail"]').value.trim();
 const active=card.querySelector('[data-field="active"]').checked;
 const emailReportEnabled=card.querySelector('[data-field="emailReportEnabled"]').checked;
 const allowedGrades=[...card.querySelectorAll("[data-grade]:checked")].map(x=>Number(x.dataset.grade));
 const allowedTopics=[...card.querySelectorAll("[data-topic]:checked")].map(x=>x.dataset.topic);
 if(!displayName){state.textContent="Họ tên không được để trống.";return}
 if(emailReportEnabled&&!parentEmail){state.textContent="Cần nhập email phụ huynh trước khi bật báo cáo.";return}
 button.disabled=true;state.textContent="Đang lưu…";
 try{await updateDoc(doc(db,"users",id),{displayName,parentEmail,active,emailReportEnabled,allowedGrades,allowedTopics,updatedAt:serverTimestamp()});
  state.textContent="Đã lưu ✓"; const r=records.find(x=>x.id===id);Object.assign(r,{displayName,parentEmail,active,emailReportEnabled,allowedGrades,allowedTopics});
 }catch(e){state.textContent=`Lỗi: ${e.message}`;}finally{button.disabled=false}
}
searchEl.addEventListener("input",render);document.getElementById("reloadButton").addEventListener("click",load);load();
