
"use strict";

// Catholic Discovery — Main Website Script
// Firebase Firestore, YouTube videos, website statistics,
// daily readings, prayer, navigation, and theme settings.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --------------------------------------------------
// FIREBASE CONFIGURATION
// --------------------------------------------------

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

// --------------------------------------------------
// WEBSITE SETTINGS
// --------------------------------------------------

const CHANNEL_URL = "https://www.youtube.com/@CTF-q5l";

const API_BASE_URL =
  "https://catholic-discovery-api.micnu123.workers.dev";

// --------------------------------------------------
// DAILY PRAYERS
// --------------------------------------------------

const DAILY_PRAYERS = [
  "Lord Jesus, guide us daily in faith, hope, and love. Open our hearts to Your Word and help us live as joyful witnesses of the Gospel. Amen.",

  "Heavenly Father, fill our homes with peace, our hearts with charity, and our lives with the light of Christ. Amen.",

  "Holy Spirit, teach us to listen, strengthen us in prayer, and lead us closer to Jesus each day. Amen.",

  "Blessed Mother Mary, pray for us and help us say yes to God with humble and faithful hearts. Amen.",

  "Lord, make us instruments of Your peace. Where there is doubt, bring faith; where there is sadness, bring hope; where there is darkness, bring Your light. Amen.",

  "Jesus, present in the Eucharist, nourish our souls and help us love You more deeply in every moment of this day. Amen."
];

// --------------------------------------------------
// FALLBACK POSTS
// Displayed if Firestore has no published posts
// or cannot be reached.
// --------------------------------------------------

const FALLBACK_POSTS = [
  {
    title: "Welcome to Catholic Discovery",
    date: "2026-06-27",
    body: "Welcome to Catholic Discovery. Explore Catholic reflections, ministry updates, announcements, and prayers to help you grow in faith."
  }
];

// --------------------------------------------------
// DAILY READINGS
// Add date-specific entries using YYYY-MM-DD.
// The default entry is shown when today's date
// has no matching entry.
// --------------------------------------------------

const READINGS_SOURCE_BASE_URL =
  "https://bible.usccb.org/bible/readings";

const DAILY_READINGS = [
  {
    date: "default",
    title: "Daily Catholic Readings",
    readings: [
      {
        label: "First Reading",
        reference: "Visit the official readings",
        text: "Read and reflect on the Word of God."
      },
      {
        label: "Responsorial Psalm",
        reference: "Visit the official readings",
        text: "Pray with the Psalms."
      },
      {
        label: "Second Reading",
        reference: "Visit the official readings",
        text: "Explore the appointed Scripture reading."
      },
      {
        label: "Gospel",
        reference: "Visit the official readings",
        text: "Reflect on the Gospel of Jesus Christ."
      }
    ]
  }
];

// --------------------------------------------------
// HTML ELEMENTS
// --------------------------------------------------

const elements = {
  header: document.querySelector("[data-header]"),
  menuToggle: document.querySelector("[data-menu-toggle]"),
  navLinks: document.querySelector("[data-nav-links]"),

  themeToggle: document.querySelector("[data-theme-toggle]"),
  themeIcon: document.querySelector("[data-theme-icon]"),
  themeLabel: document.querySelector("[data-theme-label]"),

  currentYear: document.querySelector("[data-current-year]"),
  prayerText: document.querySelector("[data-prayer-text]"),

  postsGrid: document.querySelector("[data-posts-grid]"),
  postStatus: document.querySelector("[data-post-status]"),

  readingDate: document.querySelector("[data-reading-date]"),
  readingSource: document.querySelector("[data-reading-source]"),
  readingTitle: document.querySelector("[data-reading-title]"),
  readingsList: document.querySelector("[data-readings-list]"),

  featuredVideo: document.querySelector("[data-featured-video]"),
  videoGrid: document.querySelector("[data-video-grid]"),
  videoStatus: document.querySelector("[data-video-status]")
};

// --------------------------------------------------
// INITIALIZE WEBSITE
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  displayDailyReadings();
  displayRandomPrayer();

  setupLogoFallback();
  setupThemeToggle();
  setupNavigation();
  setupRevealAnimations();

  loadPosts();
  loadLatestVideos();
  loadWebsiteStats();
});

// --------------------------------------------------
// CURRENT YEAR
// --------------------------------------------------

function setCurrentYear() {
  if (elements.currentYear) {
    elements.currentYear.textContent =
      new Date().getFullYear();
  }
}

// --------------------------------------------------
// DAILY READINGS
// --------------------------------------------------

function displayDailyReadings() {
  if (
    !elements.readingDate ||
    !elements.readingTitle ||
    !elements.readingsList
  ) {
    return;
  }

  const todayKey = getLocalDateKey(new Date());
  const officialReadingsUrl =
    getOfficialReadingsUrl(todayKey);

  const readingSet =
    DAILY_READINGS.find(item => item.date === todayKey) ||
    DAILY_READINGS.find(item => item.date === "default");

  if (elements.readingSource) {
    elements.readingSource.href = officialReadingsUrl;
    elements.readingSource.textContent =
      "Open today's official readings";

    elements.readingSource.target = "_blank";
    elements.readingSource.rel = "noopener noreferrer";
  }

  if (!readingSet) {
    elements.readingDate.textContent =
      formatDate(todayKey);

    elements.readingTitle.textContent =
      "Daily readings unavailable";

    elements.readingsList.textContent =
      "No readings are available right now.";

    return;
  }

  elements.readingDate.textContent =
    readingSet.date === "default"
      ? `Today: ${formatDate(todayKey)}`
      : formatDate(readingSet.date);

  elements.readingTitle.textContent =
    readingSet.title;

  elements.readingsList.innerHTML =
    readingSet.readings.map(reading => `
      <article class="reading-card">
        <h4>${escapeHtml(reading.label)}</h4>
        <strong>${escapeHtml(reading.reference)}</strong>
        <p>${escapeHtml(reading.text)}</p>
      </article>
    `).join("");
}

function getOfficialReadingsUrl(dateKey) {
  const [year, month, day] = dateKey.split("-");
  const shortYear = year.slice(2);

  return `${READINGS_SOURCE_BASE_URL}/${month}${day}${shortYear}.cfm`;
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// --------------------------------------------------
// RANDOM PRAYER
// --------------------------------------------------

function displayRandomPrayer() {
  if (!elements.prayerText) return;

  const randomIndex = Math.floor(
    Math.random() * DAILY_PRAYERS.length
  );

  elements.prayerText.textContent =
    DAILY_PRAYERS[randomIndex];
}

// --------------------------------------------------
// LOGO FALLBACK
// --------------------------------------------------

function setupLogoFallback() {
  document.querySelectorAll("[data-logo]").forEach(logo => {
    logo.addEventListener("error", () => {
      if (!logo.dataset.triedJpg) {
        logo.dataset.triedJpg = "true";
        logo.src = "logo.jpg";
        return;
      }

      const container = logo.closest(
        ".logo-wrap, .hero-logo-wrap"
      );

      if (container) {
        container.classList.add("logo-missing");
      }
    });
  });
}

// --------------------------------------------------
// LOAD PUBLISHED POSTS FROM FIRESTORE
// --------------------------------------------------

async function loadPosts() {
  if (!elements.postsGrid) return;

  if (elements.postStatus) {
    elements.postStatus.textContent =
      "Loading published posts...";
  }

  try {
    // IMPORTANT:
    // Public Firestore rules only permit reading
    // documents whose status is "published".
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(postsQuery);

    const posts = snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    }));

    if (posts.length === 0) {
      renderPosts(FALLBACK_POSTS);

      if (elements.postStatus) {
        elements.postStatus.textContent =
          "No published posts yet.";
      }

      return;
    }

    renderPosts(posts);

    if (elements.postStatus) {
      elements.postStatus.textContent = "";
    }

  } catch (error) {
    console.error(
      "Failed to load published posts from Firestore:",
      error
    );

    renderPosts(FALLBACK_POSTS);

    if (elements.postStatus) {
      elements.postStatus.textContent =
        "Unable to load posts right now. Showing sample content.";
    }
  }
}

// --------------------------------------------------
// RENDER POSTS
// --------------------------------------------------

function renderPosts(posts) {
  if (!elements.postsGrid) return;

  const sortedPosts = [...posts].sort((a, b) => {
    return getDateMilliseconds(b.date) -
      getDateMilliseconds(a.date);
  });

  elements.postsGrid.innerHTML = sortedPosts.map(post => {
    const title = post.title || "Untitled post";

    // Supports either "body" or "content" as the
    // main text field in Firestore.
    const body = post.body || post.content || post.excerpt || "";

    const dateValue = getDateValue(post.date);
    const dateTime = getDateTimeAttribute(dateValue);

    return `
      <article class="post-card">
        <time datetime="${escapeHtml(dateTime)}">
          ${escapeHtml(formatDate(dateValue))}
        </time>

        <h3>${escapeHtml(title)}</h3>

        <p>${escapeHtml(body)}</p>
      </article>
    `;
  }).join("");
}

// --------------------------------------------------
// THEME TOGGLE
// --------------------------------------------------

function setupThemeToggle() {
  if (!elements.themeToggle) return;

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem(
      "catholic-discovery-theme"
    );
  } catch (error) {
    console.warn("Could not read saved theme:", error);
  }

  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  const startingTheme =
    savedTheme || (prefersLight ? "light" : "dark");

  applyTheme(startingTheme);

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "light"
        ? "dark"
        : "light";

    try {
      localStorage.setItem(
        "catholic-discovery-theme",
        nextTheme
      );
    } catch (error) {
      console.warn("Could not save theme:", error);
    }

    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  const isLight = theme === "light";

  document.documentElement.dataset.theme =
    isLight ? "light" : "dark";

  if (elements.themeIcon) {
    elements.themeIcon.textContent =
      isLight ? "Sun" : "Moon";
  }

  if (elements.themeLabel) {
    elements.themeLabel.textContent =
      isLight ? "Light" : "Dark";
  }

  if (elements.themeToggle) {
    elements.themeToggle.setAttribute(
      "aria-label",
      `Switch to ${isLight ? "dark" : "light"} theme`
    );
  }
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

function setupNavigation() {
  if (elements.header) {
    window.addEventListener("scroll", () => {
      elements.header.classList.toggle(
        "is-scrolled",
        window.scrollY > 8
      );
    }, { passive: true });
  }

  if (elements.menuToggle && elements.navLinks) {
    elements.menuToggle.addEventListener("click", () => {
      const isOpen =
        elements.navLinks.classList.toggle("is-open");

      elements.menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      elements.menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );

      document.body.classList.toggle(
        "menu-open",
        isOpen
      );
    });

    elements.navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileMenu);
    });
  }
}

function closeMobileMenu() {
  if (!elements.menuToggle || !elements.navLinks) return;

  elements.navLinks.classList.remove("is-open");

  elements.menuToggle.setAttribute(
    "aria-expanded",
    "false"
  );

  elements.menuToggle.setAttribute(
    "aria-label",
    "Open menu"
  );

  document.body.classList.remove("menu-open");
}

// --------------------------------------------------
// REVEAL ANIMATIONS
// --------------------------------------------------

function setupRevealAnimations() {
  const revealItems =
    document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(item => {
      item.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14
  });

  revealItems.forEach(item => observer.observe(item));
}

// --------------------------------------------------
// WEBSITE STATISTICS
// --------------------------------------------------

async function loadWebsiteStats() {
  const subscriberElement =
    document.getElementById("subscriberCount");

  const visitorElement =
    document.getElementById("visitorCount");

  if (!subscriberElement || !visitorElement) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stats`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Statistics request failed: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (data.hiddenSubscriberCount === true) {
      subscriberElement.textContent = "N/A";
    } else {
      subscriberElement.textContent =
        Number(data.subscriberCount || 0).toLocaleString();
    }

    visitorElement.textContent =
      Number(data.visitorCount || 0).toLocaleString();

  } catch (error) {
    console.error("Statistics error:", error);

    subscriberElement.textContent = "—";
    visitorElement.textContent = "—";
  }
}

// --------------------------------------------------
// YOUTUBE VIDEOS
// --------------------------------------------------

async function loadLatestVideos() {
  if (
    !elements.featuredVideo ||
    !elements.videoGrid ||
    !elements.videoStatus
  ) {
    return;
  }

  showLoadingState();

  try {
    const videos = await fetchVideosFromYouTubeApi();

    if (!videos.length) {
      throw new Error("No videos were returned by the API.");
    }

    renderFeaturedVideo(videos[0]);
    renderVideoGrid(videos.slice(1, 10));

    elements.videoStatus.textContent = "";
    elements.videoStatus.classList.remove("error");

  } catch (error) {
    console.warn("YouTube API failed:", error);
    renderVideoError();
  }
}

function showLoadingState() {
  elements.videoStatus.textContent =
    "Loading latest videos...";

  elements.videoStatus.classList.remove("error");

  elements.featuredVideo.innerHTML = `
    <div class="video-loader" aria-hidden="true"></div>

    <div class="featured-info">
      <p class="card-label">Loading</p>
      <h3>Connecting to YouTube...</h3>
      <p>Please wait while the latest Catholic Discovery videos are fetched.</p>
    </div>
  `;

  elements.videoGrid.innerHTML =
    Array.from({ length: 9 }, () => `
      <article class="video-card" aria-hidden="true">
        <div class="video-loader"></div>

        <div class="video-card-content">
          <h3>Loading video...</h3>
          <time>One moment</time>
        </div>
      </article>
    `).join("");
}

async function fetchVideosFromYouTubeApi() {
  const response = await fetch(API_BASE_URL + "/", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`YouTube API returned HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The video API did not return a list.");
  }

  return data.map(video => ({
    videoId: video.id,
    title: video.title || "Catholic Discovery video",
    description: video.description || "",
    publishedAt: video.published || "",
    thumbnail: video.thumbnail || "",
    url: video.url || (
      "https://www.youtube.com/watch?v=" +
      encodeURIComponent(video.id || "")
    )
  })).filter(video => video.videoId);
}

function renderFeaturedVideo(video) {
  const videoId = encodeURIComponent(video.videoId);

  elements.featuredVideo.innerHTML = `
    <iframe
      title="${escapeHtml(video.title)}"
      src="https://www.youtube.com/embed/${videoId}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>

    <div class="featured-info">
      <p class="card-label">Featured latest video</p>
      <h3>${escapeHtml(video.title)}</h3>
      <p>${escapeHtml(trimText(video.description, 150))}</p>
      <p>${escapeHtml(formatDate(video.publishedAt))}</p>

      <a
        class="text-link"
        href="${escapeHtml(video.url)}"
        target="_blank"
        rel="noopener noreferrer">
        Watch on YouTube
      </a>
    </div>
  `;
}

function renderVideoGrid(videos) {
  elements.videoGrid.innerHTML = videos.map(video => `
    <article class="video-card">
      <a
        class="video-thumb"
        href="${escapeHtml(video.url)}"
        target="_blank"
        rel="noopener noreferrer">

        <img
          src="${escapeHtml(video.thumbnail)}"
          alt="${escapeHtml(video.title)}"
          loading="lazy">

        <span class="play-badge" aria-hidden="true"></span>
      </a>

      <div class="video-card-content">
        <h3>${escapeHtml(video.title)}</h3>
        <time>${escapeHtml(formatDate(video.publishedAt))}</time>
      </div>
    </article>
  `).join("");
}

function renderVideoError() {
  elements.featuredVideo.innerHTML = `
    <div class="featured-info">
      <h3>Videos unavailable</h3>
      <p>Could not load the latest videos right now.</p>

      <a
        href="${CHANNEL_URL}"
        target="_blank"
        rel="noopener noreferrer">
        Open YouTube Channel
      </a>
    </div>
  `;

  elements.videoGrid.innerHTML = "";

  elements.videoStatus.textContent =
    "YouTube is currently unavailable.";

  elements.videoStatus.classList.add("error");
}

// --------------------------------------------------
// DATE HELPERS
// Supports strings, JavaScript Dates, and Firestore
// Timestamp objects.
// --------------------------------------------------

function getDateValue(value) {
  if (!value) return "";

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return value;
}

function getDateMilliseconds(value) {
  const dateValue = getDateValue(value);

  if (dateValue instanceof Date) {
    return dateValue.getTime();
  }

  const timestamp = new Date(dateValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getDateTimeAttribute(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toISOString();
}

function formatDate(dateValue) {
  const value = getDateValue(dateValue);

  if (!value) return "Date unavailable";

  const date = value instanceof Date
    ? value
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string"
      ? value
      : "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// --------------------------------------------------
// TEXT HELPERS
// --------------------------------------------------

function trimText(text, maxLength) {
  if (!text) return "";

  const value = String(text);

  return value.length > maxLength
    ? value.slice(0, maxLength) + "..."
    : value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
