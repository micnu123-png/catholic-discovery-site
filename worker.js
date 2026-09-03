var __defProp = Object.defineProperty;

var __name = (target, value) =>
  __defProp(target, "name", {
    value,
    configurable: true
  });

/*
 * Catholic Discovery Worker
 *
 * Handles:
 * 1. Website update mode
 * 2. YouTube subscriber count
 * 3. Website visitor count
 */

const CHANNEL_ID = "UCC2-EIXX2LSYInLPSR3kxPQ";

var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * ==========================================
     * API: WEBSITE + YOUTUBE STATISTICS
     * ==========================================
     */

    if (
      request.method === "GET" &&
      url.pathname === "/api/stats"
    ) {
      return handleStats(request, env);
    }

    /*
     * ==========================================
     * EXISTING UPDATE MODE SYSTEM
     * ==========================================
     */

    if (
      request.method === "GET" &&
      (url.pathname === "/" ||
        url.pathname === "/index.html")
    ) {
      try {
        const updateMode = await getUpdateMode(env);

        const page = updateMode
          ? "/update.html"
          : "/index.html";

        return env.ASSETS.fetch(
          new Request(
            new URL(page, url),
            request
          )
        );
      } catch (error) {
        console.error(
          "Update mode check failed:",
          error
        );

        return env.ASSETS.fetch(
          new Request(
            new URL("/index.html", url),
            request
          )
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};


/*
 * ==========================================
 * GET WEBSITE + YOUTUBE STATISTICS
 * ==========================================
 */

async function handleStats(request, env) {
  try {
    /*
     * Count this website visit.
     */

    let visitorCount =
      Number(
        await env.STATS.get("total_visitors")
      ) || 0;

    visitorCount++;

    await env.STATS.put(
      "total_visitors",
      String(visitorCount)
    );


    /*
     * Get YouTube subscriber count.
     */

    const youtubeUrl =
      "https://www.googleapis.com/youtube/v3/channels" +
      "?part=snippet,statistics" +
      "&id=" +
      encodeURIComponent(CHANNEL_ID) +
      "&key=" +
      encodeURIComponent(env.YOUTUBE_API_KEY);

    const youtubeResponse =
      await fetch(youtubeUrl);

    if (!youtubeResponse.ok) {
      throw new Error(
        `YouTube API returned HTTP ${youtubeResponse.status}`
      );
    }

    const youtubeData =
      await youtubeResponse.json();

    if (
      !youtubeData.items ||
      youtubeData.items.length === 0
    ) {
      throw new Error(
        "Catholic Discovery YouTube channel was not found."
      );
    }

    const channel =
      youtubeData.items[0];

    const statistics =
      channel.statistics || {};

    const snippet =
      channel.snippet || {};

    const subscriberCount =
      statistics.subscriberCount || 0;

    const hiddenSubscriberCount =
      statistics.hiddenSubscriberCount === true;


    /*
     * Return the statistics to the website.
     */

    return new Response(
      JSON.stringify({
        channelName:
          snippet.title || "Catholic Discovery",

        subscriberCount:
          subscriberCount,

        hiddenSubscriberCount:
          hiddenSubscriberCount,

        visitorCount:
          visitorCount
      }),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=UTF-8",

          "Cache-Control":
            "no-store",

          "Access-Control-Allow-Origin":
            "*"
        }
      }
    );

  } catch (error) {

    console.error(
      "Statistics error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Unable to load statistics."
      }),
      {
        status: 500,

        headers: {
          "Content-Type":
            "application/json; charset=UTF-8",

          "Access-Control-Allow-Origin":
            "*"
        }
      }
    );
  }
}

__name(handleStats, "handleStats");


/*
 * ==========================================
 * EXISTING FIRESTORE UPDATE MODE FUNCTION
 * ==========================================
 */

async function getUpdateMode(env) {

  const url =
    `https://firestore.googleapis.com/v1/projects/` +
    `${encodeURIComponent(env.FIREBASE_PROJECT_ID)}` +
    `/databases/(default)/documents/websiteSettings/main` +
    `?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`;

  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        "Accept": "application/json"
      }
    });

  if (!response.ok) {
    throw new Error(
      `Firestore returned HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  return (
    data?.fields?.updateMode?.booleanValue === true
  );
}

__name(getUpdateMode, "getUpdateMode");


export {
  worker_default as default
};

//# sourceMappingURL=worker.js.map