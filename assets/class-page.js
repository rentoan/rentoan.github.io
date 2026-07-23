import { requireAccess, renderAccount } from "./auth-service.js";
const session = await requireAccess({ loginPath: "../login.html", deniedPath: "../khong-co-quyen.html", grade: 8 });
if (session) renderAccount(session, document.getElementById("accountBox"));
