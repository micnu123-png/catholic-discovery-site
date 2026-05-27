"use strict";

// YouTube Data API v3 settings.
// If the key is restricted, allow requests from your deployed domain.
const API_KEY = "AIzaSyCJb5qtT830_hDgjJ2Sr4ZrbcmxDA6hDcA";
const CHANNEL_ID = "UCkDYIeGnavKtlGDuC08rE_g";
const CHANNEL_URL = "https://www.youtube.com/@CTF-q5l";
const MAX_RESULTS = 10;

// Edit this prayer whenever you want to update the Daily Prayer section.
const DAILY_PRAYER = "Lord Jesus, guide us daily in faith, hope, and love. Open our hearts to Your Word, strengthen our families, and help us live as joyful witnesses of the Gospel. Amen.";

const elements = {
  header: document.querySelector("[data-header]"),
  menuToggle: document.querySelector("[data-menu-toggle]"),
  navLinks: document.querySelector("[data-nav-links]"),
  themeToggle: document.querySelector("[data-theme-toggle]"),
  themeIcon: document.querySelector("[data-theme-icon]"),
  themeLabel: document.querySelector("[data-theme-label]"),
  currentYear: document.querySelector("[data-current-year]"),
  prayerText: document.querySelector("[data-prayer-text]"),
  featuredVideo: document.querySelector("[data-featured-video]"),
  videoGrid: document.querySelector("[data-video-grid]"),
  videoStatus: document.querySelector("[data-video-status]")
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  setDailyPrayer();
  setupLogoFallback();
  setupThemeToggle();
  setupNavigation();
  setupRevealAnimations();
  loadLatestVideos();
});

function setCurrentYear() {
  elements.currentYear.textContent = new Date().getFullYear();
}

function setDailyPrayer() {
  elements.prayerText.textContent = DAILY_PRAYER;
}

function setupLogoFallback() {
  document.querySelectorAll("[data-logo]").forEach((logo) => {
    logo.addEventListener("error", () => {
      logo.closest(".logo-wrap, .hero-logo-wrap")?.classList.add("logo-missing");
    });
  });
}

function setupThemeToggle() {
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
  elements.themeIcon.textContent = isLight ? "Sun" : "Moon";
  elements.themeLabel.textContent = isLight ? "Light" : "Dark";
}

function setupNavigation() {
  window.addEventListener("scroll", () => {
    elements.header.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

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

function closeMobileMenu() {
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
  showLoadingState();

  try {
    const videos = await fetchVideosFromYouTubeApi();
    if (!videos.length) throw new Error("No videos were returned by YouTube.");

    renderFeaturedVideo(videos[0]);
    renderVideoGrid(videos);
    elements.videoStatus.textContent = "";
    elements.videoStatus.classList.remove("error");
  } catch (apiError) {
    console.warn("YouTube API failed. Trying RSS fallback.", apiError);

    try {
      const videos = await fetchVideosFromRssFallback();
      renderFeaturedVideo(videos[0]);
      renderVideoGrid(videos);
      elements.videoStatus.textContent = "Videos loaded through the RSS fallback because the YouTube API request was unavailable.";
      elements.videoStatus.classList.remove("error");
    } catch (rssError) {
      console.warn("RSS fallback failed.", rssError);
      renderVideoError();
    }
  }
}

function showLoadingState() {
  elements.videoStatus.textContent = "Loading latest videos...";
  elements.videoStatus.classList.remove("error");
  elements.videoGrid.innerHTML = Array.from({ length: 6 }, () => `
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
  if (!response.ok) throw new Error(`YouTube API returned ${response.status}.`);

  const data = await response.json();
  return (data.items || []).map((item) => {
    const videoId = item.id?.videoId || "";
    const snippet = item.snippet || {};

    return {
      videoId,
      title: snippet.title || "Catholic Discovery video",
      description: snippet.description || "",
      publishedAt: snippet.publishedAt || "",
      thumbnail: getBestThumbnail(snippet.thumbnails),
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  }).filter((video) => video.videoId);
}

async function fetchVideosFromRssFallback() {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const rssToJsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  const response = await fetch(rssToJsonUrl);
  if (!response.ok) throw new Error(`RSS fallback returned ${response.status}.`);

  const data = await response.json();
  if (!data.items || !data.items.length) throw new Error("RSS fallback returned no videos.");

  return data.items.slice(0, MAX_RESULTS).map((item) => {
    const videoId = extractVideoId(item.link || "");

    return {
      videoId,
      title: item.title || "Catholic Discovery video",
      description: item.description || "",
      publishedAt: item.pubDate || "",
      thumbnail: item.thumbnail || getYouTubeThumbnail(videoId),
      url: item.link || CHANNEL_URL
    };
  });
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
      <h3>${escapeHtml(video.title)}</h3>
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
        <h3>${escapeHtml(video.title)}</h3>
        <time datetime="${video.publishedAt}">${formatDate(video.publishedAt)}</time>
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
      <p>Please visit the YouTube channel directly while the feed is unavailable.</p>
      <a class="text-link" href="${CHANNEL_URL}" target="_blank" rel="noopener">Open Catholic Discovery on YouTube</a>
    </div>
  `;

  elements.videoGrid.innerHTML = "";
  elements.videoStatus.textContent = "We could not reach YouTube at this moment. Check the API key, channel ID, or browser network access.";
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

function getYouTubeThumbnail(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "logo.png";
}

function extractVideoId(url) {
  const match = String(url).match(/[?&]v=([^&]+)/);
  return match ? match[1] : "";
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (!dateValue || Number.isNaN(date.getTime())) return "Recent upload";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function trimText(text, maxLength) {
  if (!text) return "Watch the latest Catholic Discovery reflection on YouTube.";
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
