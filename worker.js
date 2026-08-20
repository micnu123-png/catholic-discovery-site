export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    /*
     * Only control the homepage.
     *
     * Other files such as:
     *
     * /readings.html
     * /style.css
     * /script.js
     * /logo.png
     *
     * continue working normally.
     */

    if (
      request.method === "GET" &&
      (
        url.pathname === "/" ||
        url.pathname === "/index.html"
      )
    ) {

      try {

        const updateMode =
          await getUpdateMode(env);

        const page =
          updateMode
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

        /*
         * Safety fallback:
         * if Firebase fails, show the normal website.
         */

        return env.ASSETS.fetch(
          new Request(
            new URL("/index.html", url),
            request
          )
        );
      }
    }

    /*
     * Everything else is served normally.
     */

    return env.ASSETS.fetch(request);
  }
};


async function getUpdateMode(env) {

  const url =
    `https://firestore.googleapis.com/v1/projects/` +
    `${encodeURIComponent(env.FIREBASE_PROJECT_ID)}` +
    `/databases/(default)/documents/` +
    `websiteSettings/main` +
    `?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`;

  const response = await fetch(url, {
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

  const data = await response.json();

  return (
    data?.fields?.updateMode?.booleanValue === true
  );
}
