"use strict";

// =====================
// FIREBASE SETUP
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWQC1tU9HyyrQhNVt3t3Ep1rhtzYmobMQ",
  authDomain: "catholic-discovery-websi-af85b.firebaseapp.com",
  projectId: "catholic-discovery-websi-af85b",
  storageBucket: "catholic-discovery-websi-af85b.appspot.com",
  messagingSenderId: "981649696506",
  appId: "1:981649696506:web:06ecfceeee7fb90bb50b43"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================
// ELEMENTS
// =====================
const elements = {
  postsGrid: document.querySelector("[data-posts-grid]"),
  postStatus: document.querySelector("[data-post-status]")
};

// =====================
// FALLBACK POSTS
// =====================
const FALLBACK_POSTS = [
  {
    title: "Welcome to Catholic Discovery",
    date: "2026-06-27",
    body: "This posts area is ready for ministry updates."
  }
];

// =====================
// LOAD POSTS
// =====================
async function loadPosts() {
  if (!elements.postsGrid) return;

  try {
    const snapshot = await getDocs(collection(db, "posts"));

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (posts.length === 0) throw new Error("No posts found");

    renderPosts(posts);

    if (elements.postStatus) {
      elements.postStatus.textContent = "";
    }

  } catch (error) {
    console.error("Firebase error:", error);

    renderPosts(FALLBACK_POSTS);

    if (elements.postStatus) {
      elements.postStatus.textContent =
        "Using offline posts (check Firebase connection).";
    }
  }
}

// =====================
// HTML SAFETY
// =====================
function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =====================
// RENDER POSTS
// =====================
function renderPosts(posts) {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  elements.postsGrid.innerHTML = sorted.map(post => `
    <article class="post-card">
      <time datetime="${escapeHtml(post.date || "")}">
        ${escapeHtml(post.date || "")}
      </time>
      <h3>${escapeHtml(post.title || "Untitled Post")}</h3>
      <p>${escapeHtml(post.body || "")}</p>
    </article>
  `).join("");
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});
