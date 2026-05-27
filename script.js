"use strict";

const CHANNEL_ID = "UCkDYIeGnavKtlGDuC08rE_g";
const CHANNEL_URL = "https://www.youtube.com/@CTF-q5l";
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`;

// Add a YouTube Data API v3 key here for the most reliable automatic video loading.
// Example: const YOUTUBE_API_KEY = "AIza...";
const YOUTUBE_API_KEY = "";

// Edit this prayer any time without touching the HTML.
const DAILY_PRAYER = `Lord Jesus, guide us daily in faith, hope, and love. Open our hearts to Your Word, strengthen our families, and help us live as joyful witnesses of the Gospel. Amen.`;

const fallbackVideos = [
  {
    title: "Catholic Discovery on YouTube",
    videoId: "",
    url: CHANNEL_URL,
    publishedAt: new Date().toISOString(),
    thumbnail: "logo.png"
  }
];

const selectors = {
  header: document.querySelector("[data-header]"),
  menuToggle: document.querySelector("[data-menu-toggle]"),
  navPanel: document.querySelector("[data-nav-panel]"),
  themeToggle: document.querySelector("[data-theme-toggle]"),
  themeIcon: document.querySelector("[data-theme-icon]"),
  themeLabel: document.querySelector("[data-theme-label]"),
  year: document.querySelector("[data-current-year]"),
  prayerText: document.querySelector("[data-prayer-text]"),
  videoGrid: document.querySelector("[data-video-grid]"),
  videoStatus: document.querySelector("[data-video-status]"),
  featuredVideo: document.querySelector("[data-featured-video]"),
  playlistFallback: document.querySelector("[data-playlist-fallback]")
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  setPrayerText();
  initTheme();
  initNavigation();
  initRevealAnimations();
  loadLatestVideos();
});

function setCurrentYear() {
  selectors.year.textContent = new Date().getFullYear();
}

function setPrayerText() {
  selectors.prayerText.textContent = DAILY_PRAYER;
}

function initTheme() {
  const savedTheme = localStorage.getItem("catholic-discovery-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = savedTheme || (prefersLight ? "light" : "dark");

  applyTheme(initialTheme);

  selectors.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("catholic-discovery-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isLight = theme === "light";
  selectors.themeIcon.textContent = isLight ? "☀" : "☾";
  selectors.themeLabel.textContent = isLight ? "Light" : "Dark";
}

function initNavigation() {
  window.addEventListener("scroll", () => {
    selectors.header.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  selectors.menuToggle.addEventListener("click", () => {
    const isOpen = selectors.navPanel.classList.toggle("is-open");
    selectors.menuToggle.setAttribute("aria-expanded", String(isOpen));
    selectors.menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  selectors.navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMobileMenu());
  });
}

function closeMobileMenu() {
  selectors.navPanel.classList.remove("is-open");
  selectors.menuToggle.setAttribute("aria-expanded", "false");
  selectors.menuToggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
}

function initRevealAnimations() {
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
  try {
    const videos = YOUTUBE_API_KEY
      ? await fetchVideosFromYouTubeApi()
      : await fetchVideosFromRss();

    renderVideos(videos.slice(0, 6));
    renderFeaturedVideo(videos[0]);
    selectors.videoStatus.textContent = "";
  } catch (error) {
    console.warn("Video feed unavailable:", error);
    renderVideos(fallbackVideos);
    renderFeaturedVideo(fallbackVideos[0]);
    selectors.playlistFallback.hidden = false;
    selectors.videoStatus.textContent = "The live feed could not be loaded here, but the channel playlist is available below.";
  }
}

async function fetchVideosFromYouTubeApi() {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  endpoint.search = new URLSearchParams({
    part: "snippet",
    playlistId: UPLOADS_PLAYLIST_ID,
    maxResults: "6",
    key: YOUTUBE_API_KEY
  }).toString();

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

  const data = await response.json();
  return data.items.map((item) => {
    const snippet = item.snippet;
    const videoId = snippet.resourceId.videoId;

    return {
      title: snippet.title,
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: snippet.publishedAt,
      thumbnail: getBestThumbnail(snippet.thumbnails)
    };
  });
}

async function fetchVideosFromRss() {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const rssUrls = [
    feedUrl,
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
  ];

  for (const url of rssUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`RSS response: ${response.status}`);

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return parseRssJson(data);
      }

      const xmlText = await response.text();
      return parseRssXml(xmlText);
    } catch (error) {
      console.warn(`RSS source failed: ${url}`, error);
    }
  }

  throw new Error("All RSS sources failed.");
}

function parseRssJson(data) {
  if (!data.items || !data.items.length) throw new Error("RSS JSON contained no videos.");

  return data.items.slice(0, 6).map((item) => {
    const videoId = extractVideoId(item.link || item.guid || "");

    return {
      title: item.title,
      videoId,
      url: item.link || `${CHANNEL_URL}/videos`,
      publishedAt: item.pubDate,
      thumbnail: item.thumbnail || getYouTubeThumbnail(videoId)
    };
  });
}

function parseRssXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const entries = Array.from(xml.querySelectorAll("entry"));
  if (!entries.length) throw new Error("RSS XML contained no videos.");

  return entries.slice(0, 6).map((entry) => {
    const videoId = entry.querySelector("videoId")?.textContent || "";
    const title = entry.querySelector("title")?.textContent || "Catholic Discovery video";
    const publishedAt = entry.querySelector("published")?.textContent || "";

    return {
      title,
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt,
      thumbnail: getYouTubeThumbnail(videoId)
    };
  });
}

function renderFeaturedVideo(video) {
  const embed = video.videoId
    ? `<iframe title="${escapeHtml(video.title)}" src="https://www.youtube.com/embed/${video.videoId}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    : `<a class="video-thumb" href="${video.url}" target="_blank" rel="noopener"><img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy"><span class="play-badge">▶</span></a>`;

  selectors.featuredVideo.innerHTML = `
    ${embed}
    <div class="featured-copy">
      <p class="card-kicker">Featured now</p>
      <h3>${escapeHtml(video.title)}</h3>
      <p>${formatDate(video.publishedAt)}</p>
      <a class="text-link" href="${video.url}" target="_blank" rel="noopener">Watch on YouTube</a>
    </div>
  `;
}

function renderVideos(videos) {
  selectors.videoGrid.innerHTML = videos.map((video) => `
    <article class="video-card">
      <a class="video-thumb" href="${video.url}" target="_blank" rel="noopener" aria-label="Watch ${escapeHtml(video.title)}">
        <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy">
        <span class="play-badge" aria-hidden="true">▶</span>
      </a>
      <div class="video-card-content">
        <h3>${escapeHtml(video.title)}</h3>
        <time datetime="${video.publishedAt || ""}">${formatDate(video.publishedAt)}</time>
      </div>
    </article>
  `).join("");
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
  if (!dateValue) return "Visit the channel for the latest upload.";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recent upload";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
