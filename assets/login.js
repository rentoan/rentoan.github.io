import { getSession, loginWithUsername } from "./auth-service.js";

const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const message = document.getElementById("loginMessage");
const button = document.getElementById("loginButton");
const toggle = document.getElementById("togglePassword");

const storedMessage = sessionStorage.getItem("rentoan-auth-message");
if (storedMessage) {
  message.textContent = storedMessage;
  message.className = "login-message error";
  sessionStorage.removeItem("rentoan-auth-message");
}

getSession().then(session => {
  if (session) window.location.replace("index.html");
}).catch(error => {
  message.textContent = error.message;
  message.className = "login-message error";
});

toggle.addEventListener("click", () => {
  const show = password.type === "password";
  password.type = show ? "text" : "password";
  toggle.textContent = show ? "Ẩn" : "Hiện";
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";
  button.disabled = true;
  button.textContent = "Đang đăng nhập…";
  try {
    await loginWithUsername(username.value, password.value);
    const returnUrl = sessionStorage.getItem("rentoan-return-url");
    sessionStorage.removeItem("rentoan-return-url");
    window.location.replace(returnUrl || "index.html");
  } catch (error) {
    const friendly = error.code?.startsWith("auth/")
      ? "Tên đăng nhập hoặc mật khẩu chưa đúng."
      : error.message;
    message.textContent = friendly;
    message.className = "login-message error";
  } finally {
    button.disabled = false;
    button.textContent = "Đăng nhập";
  }
});
