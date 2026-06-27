"use strict";

// YouTube Data API v3 settings.
// Replace API_KEY if you rotate your key in Google Cloud Console.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const CHANNEL_URL = "https://www.youtube.com/@CTF-q5l";
const API_KEY = "AIzaSyAlaLf4j4lsRSXFeS0_K1olojfZfskEeEI";
const CHANNEL_ID = "UCN13DiW7FaMrXmlyipTxIJA";
const MAX_RESULTS = 10;

fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
const DAILY_PRAYERS = [
  "Lord Jesus, guide us daily in faith, hope, and love. Open our hearts to Your Word and help us live as joyful witnesses of the Gospel. Amen.",
  "Heavenly Father, fill our homes with peace, our hearts with charity, and our lives with the light of Christ. Amen.",
  "Holy Spirit, teach us to listen, strengthen us in prayer, and lead us closer to Jesus each day. Amen.",
  "Blessed Mother Mary, pray for us and help us say yes to God with humble and faithful hearts. Amen.",
  "Lord, make us instruments of Your peace. Where there is doubt, bring faith; where there is sadness, bring hope; where there is darkness, bring Your light. Amen.",
  "Jesus, present in the Eucharist, nourish our souls and help us love You more deeply in every moment of this day. Amen."
];

const FALLBACK_POSTS = [
  {
    title: "Welcome to Catholic Discovery",
    date: "2026-06-27",
    body: "This posts area is ready for ministry updates, reflections, announcements, and prayer notes. "
  }
];

// Official readings source:
// The site opens the date-specific USCCB page for the full approved text.
// Add your own summaries, references, or permitted excerpts below.
const READINGS_SOURCE_BASE_URL = "https://bible.usccb.org/bible/readings";

// Add or update readings here. Use YYYY-MM-DD for a date-specific entry.
// The "default" entry displays when today's date is not listed yet.
const DAILY_READINGS = [
  {
    date: "default",
    title: "Daily Catholic Readings",
    readings: [
      {
        label: "First Reading",
        reference: "Loading...",
        text: "Loading.."
      },
      {
        label: "Responsorial Psalm",
        reference: "Loading..",
        text: "Loading.."
      },
      {
        label: "Second Reading",
        reference: "Loading...",
        text: "Loading..."
      },
      {
        label: "Gospel",
        reference: "Loading...",
        text: "Loading..."
      }
    ]
  }
];

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
});

function setCurrentYear() {
  if (elements.currentYear) {
    elements.currentYear.textContent = new Date().getFullYear();
  }
}

function displayDailyReadings() {
  if (!elements.readingDate || !elements.readingTitle || !elements.readingsList) return;

  const todayKey = getLocalDateKey(new Date());
  const officialReadingsUrl = getOfficialReadingsUrl(todayKey);
  const readingSet = DAILY_READINGS.find((item) => item.date === todayKey)
    || DAILY_READINGS.find((item) => item.date === "default");

  if (elements.readingSource) {
    elements.readingSource.href = officialReadingsUrl;
    elements.readingSource.textContent = "Open today's official readings";
  }

  if (!readingSet) {
    elements.readingDate.textContent = formatDate(todayKey);
    elements.readingTitle.textContent = "Daily readings unavailable";
    elements.readingsList.innerHTML = `
      <article class="reading-card">
        <h4>Readings</h4>
        <strong>No readings found</strong>
        <p>Add a default entry to DAILY_READINGS in script.js.</p>
      </article>
    `;
    return;
  }

  elements.readingDate.textContent = readingSet.date === "default"
    ? `Today: ${formatDate(todayKey)}`
    : formatDate(readingSet.date);
  elements.readingTitle.textContent = readingSet.title;
  elements.readingsList.innerHTML = readingSet.readings.map((reading) => `
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

function displayRandomPrayer() {
  if (!elements.prayerText) return;

  const randomIndex = Math.floor(Math.random() * DAILY_PRAYERS.length);
  elements.prayerText.textContent = DAILY_PRAYERS[randomIndex];
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function setupLogoFallback() {
  document.querySelectorAll("[data-logo]").forEach((logo) => {
    logo.addEventListener("error", () => {
      if (!logo.dataset.triedJpg) {
        logo.dataset.triedJpg = "true";
        logo.src = "logo.jpg";
        return;
      }

      const logoContainer = logo.closest(".logo-wrap, .hero-logo-wrap");
      if (logoContainer) logoContainer.classList.add("logo-missing");
    });
  });
}

async function loadPosts() {
  try {
    const snapshot = await getDocs(collection(db, "posts"));

    const posts = [];
    snapshot.forEach(doc => posts.push(doc.data()));

    renderPosts();
  } catch (err) {
    console.error("Firebase error:", err);

    renderPosts(FALLBACK_POSTS);
  }
}
function setupThemeToggle() {
  if (!elements.themeToggle) return;

  const savedTheme = localStorage.getItem("catholic-discovery-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const startingTheme = savedTheme || (prefersLight ? "light" : "dark");

  applyTheme(startingTheme);

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("catholic-discovery-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  const isLight = theme === "light";

  document.documentElement.dataset.theme = theme;

  if (elements.themeIcon) elements.themeIcon.textContent = isLight ? "Sun" : "Moon";
  if (elements.themeLabel) elements.themeLabel.textContent = isLight ? "Light" : "Dark";
}

function setupNavigation() {
  if (elements.header) {
    window.addEventListener("scroll", () => {
      elements.header.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  if (elements.menuToggle && elements.navLinks) {
    elements.menuToggle.addEventListener("click", () => {
      const isOpen = elements.navLinks.classList.toggle("is-open");

      elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
      elements.menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", isOpen);
    });

    elements.navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }
}

function closeMobileMenu() {
  if (!elements.menuToggle || !elements.navLinks) return;

  elements.navLinks.classList.remove("is-open");
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
}

async function loadLatestVideos() {
  if (!elements.featuredVideo || !elements.videoGrid || !elements.videoStatus) return;

  showLoadingState();

  try {
    const videos = await fetchVideosFromYouTubeApi();

    if (!videos.length) {
      throw new Error("No videos were returned by YouTube.");
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
  elements.videoStatus.textContent = "Loading latest videos...";
  elements.videoStatus.classList.remove("error");

  elements.featuredVideo.innerHTML = `
    <div class="video-loader" aria-hidden="true"></div>
    <div class="featured-info">
      <p class="card-label">Loading</p>
      <h3>Connecting to YouTube...</h3>
      <p>Please wait while the latest Catholic Discovery videos are fetched.</p>
    </div>
  `;

  elements.videoGrid.innerHTML = Array.from({ length: 9 }, () => `
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
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");

  endpoint.search = new URLSearchParams({
  key: API_KEY,
  channelId: CHANNEL_ID,
  part: "snippet",
  order: "date",
  type: "video",
  maxResults: String(MAX_RESULTS)
}).toString();

  const response = await fetch(endpoint);

  const data = await response.json();
  console.log("YouTube API response:", data);

  if (!response.ok) {
    throw new Error(data?.error?.message || `HTTP ${response.status}`);
  }

  return (data.items || [])
    .map(item => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      publishedAt: item.snippet?.publishedAt,
      thumbnail: getBestThumbnail(item.snippet?.thumbnails),
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`
    }))
    .filter(v => v.videoId);
}

function renderFeaturedVideo(video) {
  elements.featuredVideo.innerHTML = `
    <iframe
      title="${escapeHtml(video.title)}"
      src="https://www.youtube.com/embed/${video.videoId}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
    <div class="featured-info">
      <p class="card-label">Featured latest video</p>
      <h3>${video.title}</h3>
      <p>${escapeHtml(trimText(video.description, 150))}</p>
      <p>${formatDate(video.publishedAt)}</p>
      <a class="text-link" href="${video.url}" target="_blank" rel="noopener">Watch on YouTube</a>
    </div>
  `;
}

function renderVideoGrid(videos) {
  elements.videoGrid.innerHTML = videos.map((video) => `
    <article class="video-card">
      <a class="video-thumb" href="${video.url}" target="_blank" rel="noopener" aria-label="Watch ${escapeHtml(video.title)}">
        <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy">
        <span class="play-badge" aria-hidden="true"></span>
      </a>
      <div class="video-card-content">
        <h3>${video.title}</h3>
        <time datetime="${escapeHtml(video.publishedAt)}">${formatDate(video.publishedAt)}</time>
      </div>
    </article>
  `).join("");
}

function renderVideoError() {
  elements.featuredVideo.innerHTML = `
    <div class="video-loader" aria-hidden="true"></div>
    <div class="featured-info">
      <p class="card-label">Videos unavailable</p>
      <h3>The latest videos could not be loaded right now.</h3>
      <p>Please check the API key, channel ID, or network access, then try again.</p>
      <a class="text-link" href="${CHANNEL_URL}" target="_blank" rel="noopener">Open Catholic Discovery on YouTube</a>
    </div>
  `;

  elements.videoGrid.innerHTML = "";
  elements.videoStatus.textContent = "We could not reach YouTube at this moment. Please visit the channel directly.";
  elements.videoStatus.classList.add("error");
}

function getBestThumbnail(thumbnails = {}) {
  return thumbnails.maxres?.url
    || thumbnails.standard?.url
    || thumbnails.high?.url
    || thumbnails.medium?.url
    || thumbnails.default?.url
    || "logo.png";
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (!dateValue || Number.isNaN(date.getTime())) {
    return "Recent upload";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function trimText(text, maxLength) {
  if (!text) {
    return "Watch the latest Catholic Discovery reflection on YouTube.";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
