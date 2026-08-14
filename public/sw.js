const CACHE_VERSION = "techpath-v2";

const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

self.addEventListener("install", () => {
  // Activate the new worker immediately.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Only handle requests from Tech Path itself.
  if (url.origin !== self.location.origin) {
    return;
  }

  /* =========================================
     NEVER CACHE THESE
  ========================================= */

  if (
    url.pathname === "/sw.js" ||
    url.pathname === "/manifest.json" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/admin/")
  ) {
    return;
  }

  /* =========================================
     HTML / PAGE NAVIGATION

     NETWORK FIRST
  ========================================= */

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();

            caches.open(PAGE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          return new Response(
            `
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                  />
                  <title>Tech Path - Offline</title>
                </head>

                <body
                  style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 80px auto;
                    padding: 20px;
                    text-align: center;
                  "
                >
                  <h1>You are offline</h1>

                  <p>
                    Tech Path could not connect to the internet.
                  </p>

                  <p>
                    Please check your connection and try again.
                  </p>

                  <button
                    onclick="window.location.reload()"
                    style="
                      padding: 12px 22px;
                      border: 0;
                      border-radius: 8px;
                      cursor: pointer;
                    "
                  >
                    Try Again
                  </button>
                </body>
              </html>
            `,
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }),
    );

    return;
  }

  /* =========================================
     NEXT.JS STATIC FILES

     CACHE FIRST
  ========================================= */

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) {
          return cached;
        }

        const response = await fetch(request);

        if (response && response.ok) {
          const responseClone = response.clone();

          const cache = await caches.open(STATIC_CACHE);

          await cache.put(request, responseClone);
        }

        return response;
      }),
    );

    return;
  }

  /* =========================================
     IMAGES

     STALE-WHILE-REVALIDATE
  ========================================= */

  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkRequest = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const responseClone = response.clone();

              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }

            return response;
          })
          .catch(() => cached);

        return cached || networkRequest;
      }),
    );

    return;
  }

  /*
   * Everything else goes directly to the network.
   *
   * This is intentional.
   *
   * We do NOT want the service worker interfering
   * with Next.js RSC requests, APIs, authentication,
   * dynamic data, etc.
   */
});
