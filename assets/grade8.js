import { requireAccess, mountAccount, hasTopic } from "../core/auth.js";
import { loadDashboard, percent, masteryLabel } from "../core/progress.js";

const session = await requireAccess({ loginPath: "../login.html", deniedPath: "../khong-co-quyen.html", grade: 8 });
if (!session) throw new Error("Không có quyền.");
mountAccount(document.getElementById("accountArea"), session, { loginHref: "../login.html", progressHref: "../tien-do.html" });

const topics = [
  { id: "lop8-chude1", href: "./chu-de-1/index.html" },
  { id: "lop8-chude2", href: "./chu-de-2/index.html" },
  { id: "lop8-chude3", href: "./chu-de-3/index.html" },
  { id: "lop8-chude4", href: "./chu-de-4/index.html" },
  { id: "lop8-chude5", href: "./chu-de-5/index.html" }
];
const dashboard = await loadDashboard(topics.map(t => t.id)).catch(() => ({ topics: [] }));
topics.forEach((topic,index)=>{
  const card=document.querySelector(`[data-topic="${topic.id}"]`); if(!card)return;
  const allowed=hasTopic(session.profile,topic.id,8); if(!allowed)card.classList.add("locked"); else card.classList.remove("locked");
  const data=dashboard.topics[index]||{}, rate=percent(data.correct,data.attempted);
  card.querySelector("[data-topic-rate]").textContent=`${rate}%`;
  card.querySelector("[data-topic-attempted]").textContent=`${data.attempted||0} câu`;
  card.querySelector("[data-topic-status]").textContent=masteryLabel(data.correct,data.attempted);
  card.querySelector(".progress-fill").style.width=`${rate}%`;
  const action=card.querySelector("[data-topic-action]");
  if(allowed) action.outerHTML=`<a class="button button-primary" href="${topic.href}">Bắt đầu luyện</a>`;
  else { action.textContent="Chưa được cấp quyền"; action.disabled=true; }
});
