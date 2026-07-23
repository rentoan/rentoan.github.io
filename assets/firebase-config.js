import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEKsb5cynwAWivzeqiwaYNLQZAZvdX9sE",
  authDomain: "rentoan-4a20e.firebaseapp.com",
  projectId: "rentoan-4a20e",
  storageBucket: "rentoan-4a20e.firebasestorage.app",
  messagingSenderId: "908150868279",
  appId: "1:908150868279:web:f07899e48fcaa2df2eb2b2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const USERNAME_DOMAIN = "rentoan.local";
