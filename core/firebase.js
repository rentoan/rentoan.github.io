import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSnj6qMXUfrbdfU6sHrPDAuAAfAaQwiYY",
  authDomain: "rentoan-53cbe.firebaseapp.com",
  projectId: "rentoan-53cbe",
  storageBucket: "rentoan-53cbe.firebasestorage.app",
  messagingSenderId: "203871219234",
  appId: "1:203871219234:web:94205eb736e9a55dd5a47b",
  measurementId: "G-SH7V42ZXP3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const USERNAME_DOMAIN = "rentoan.local";
