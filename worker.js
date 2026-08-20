export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // Only intercept the homepage
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

        // TRUE = update page
        // FALSE = normal website

        const target =
          updateMode
            ? "/update.html"
            : "/index.html";

        return env.ASSETS.fetch(
          new Request(
            new URL(target, url),
            request
          )
        );

      } catch (error) {

        console.error(
          "Firebase error:",
          error
        );

        // If Firebase fails,
        // keep the normal website online.

        return env.ASSETS.fetch(
          new Request(
            new URL("/index.html", url),
            request
          )
        );
      }
    }

    // Everything else works normally
    return env.ASSETS.fetch(request);
  }
};


async function getUpdateMode(env) {

  const firestoreURL =
    `https://firestore.googleapis.com/v1/projects/` +
    `${encodeURIComponent(env.FIREBASE_PROJECT_ID)}` +
    `/databases/(default)/documents/` +
    `websiteSettings/main` +
    `?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`;

  const response = await fetch(
    firestoreURL,
    {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Firestore HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  return (
    data?.fields?.updateMode?.booleanValue === true
  );
}
