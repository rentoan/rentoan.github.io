import { getSession, login } from "../core/auth.js";

const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const message = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

const previousMessage = sessionStorage.getItem("rentoan-auth-message");
if (previousMessage) {
  message.textContent = previousMessage;
  sessionStorage.removeItem("rentoan-auth-message");
}

try {
  const session = await getSession();
  if (session) window.location.replace("./index.html");
} catch (error) {
  message.textContent = error.message;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Đang đăng nhập…";
  try {
    await login(username.value, password.value);
    const returnUrl = sessionStorage.getItem("rentoan-return-url");
    sessionStorage.removeItem("rentoan-return-url");
    window.location.replace(returnUrl || "./index.html");
  } catch (error) {
    const known = {
      "auth/invalid-credential": "Sai tên đăng nhập hoặc mật khẩu.",
      "auth/too-many-requests": "Bạn thử quá nhiều lần. Hãy chờ một lúc rồi thử lại.",
      "auth/network-request-failed": "Không kết nối được Firebase. Hãy kiểm tra Internet."
    };
    message.textContent = known[error.code] || error.message || "Đăng nhập không thành công.";
    password.select();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Đăng nhập";
  }
});
