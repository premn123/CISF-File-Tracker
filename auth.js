import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkP9unnCHDUGusBR7RCBanI8olWNh7rEg",
  authDomain: "cisf-file-tracker.firebaseapp.com",
  projectId: "cisf-file-tracker",
  storageBucket: "cisf-file-tracker.appspot.com",
  messagingSenderId: "485826204538",
  appId: "1:485826204538:web:41a7d1f9e419768f247cc3"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Toggle to show/hide forms
window.toggleSignup = () => {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("signup-section").style.display = "block";
};

window.toggleLogin = () => {
  document.getElementById("signup-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
};

// Signup function
window.signupUser = async () => {
  const cisfNo = document.getElementById("signup-cisfno").value;
  const rank = document.getElementById("signup-rank").value;
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!cisfNo || !rank || !name || !email || !password || !confirm) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    await setDoc(doc(db, "users", userId), {
      cisfNo,
      rank,
      name,
      email
    });

    alert("Signup successful!");
    // ⬇️ Show login form
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
  } catch (error) {
    alert("Signup Error: " + error.message);
  }
};

// Login function
window.loginUser = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Login Error: " + error.message);
  }
};
