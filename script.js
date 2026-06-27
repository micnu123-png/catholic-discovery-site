"use strict";

// =====================
// FIREBASE SETUP
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔴 ADD YOUR FIREBASE CONFIG HERE (FROM FIREBASE CONSOLE)
const firebaseConfig = {
  apiKey: "AIzaSyCWQC1tU9HyyrQhNVt3t3Ep1rhtzYmobMQ",
  authDomain: "catholic-discovery-websi-af85b.firebaseapp.com",
  projectId: "catholic-discovery-websi-af85b",
  storageBucket: "catholic-discovery-websi-af85b.firebasestorage.app",
  messagingSenderId: "981649696506",
  appId: "1:981649696506:web:06ecfceeee7fb90bb50b43"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================
// YOUTUBE SETTINGS
// =====================
const CHANNEL_URL = "https://www.youtube.com/@CTF-q5l";
const API_KEY = "AIzaSyAlaLf4j4lsRSXFeS0_K1olojfZfskEeEI";
const CHANNEL_ID = "UCN13DiW7FaMrXmlyipTxIJA";
const MAX_RESULTS = 10;

// =====================
// POSTS FALLBACK
// =====================
const FALLBACK_POSTS = [
  {
    title: "Welcome to Catholic Discovery",
    date: "2026-06-27",
    body: "This posts area is ready for ministry updates."
  }
];

// =====================
// ELEMENTS
// =====================
const elements = {
  postsGrid: document.querySelector("[data-posts-grid]"),
  postStatus: document.querySelector("[data-post-status]")
};

// =====================
// LOAD POSTS FROM FIREBASE
// =====================
async function loadPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));

    const posts = [];

    querySnapshot.forEach((doc) => {
      posts.push(doc.data());
    });

    renderPosts(posts);
    elements.postStatus.textContent = "";
  } catch (error) {
    console.error("Firebase error:", error);

    // fallback if Firebase fails
    renderPosts(FALLBACK_POSTS);
    elements.postStatus.textContent =
      "Using offline posts (Firebase not connected properly).";
  }
}

// =====================
// RENDER POSTS
// =====================
function renderPosts(posts) {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  elements.postsGrid.innerHTML = sorted.map(post => `
    <article class="post-card">
      <time>${post.date}</time>
      <h3>${post.title}</h3>
      <p>${post.body}</p>
    </article>
  `).join("");
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});
