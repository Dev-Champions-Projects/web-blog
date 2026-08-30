const CACHE_VERSION = "techpath-v4";

const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const IMAGE_CACHE = `${CACHE_VERSION}-images`;

/* =========================================
   INSTALL
========================================= */

self.addEventListener(
  "install",

  () => {
    self.skipWaiting();
  },
);

/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
  "activate",

  (event) => {
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
  },
);

/* =========================================
   PUSH NOTIFICATIONS
========================================= */

self.addEventListener(
  "push",

  (event) => {
    let payload = {};

    if (event.data) {
      try {
        payload = event.data.json();
      } catch {
        payload = {
          body: event.data.text(),
        };
      }
    }

    const title = payload.title || "Tech Path";

    const options = {
      body: payload.body || "A new Tech Path update is available.",
      icon: payload.icon || "/icons/icon-192.png",
      badge: payload.badge || "/icons/icon-192.png",
      tag: payload.tag || "tech-path-notification",
      renotify: Boolean(payload.renotify),
      data: {
        url: payload.url || "/blog/feed/1",
        type: payload.type || "general",
        campaign: payload.campaign || payload.type || "general",
        pushId: payload.pushId || payload.tag || "",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  },
);

/* =========================================
   NOTIFICATION CLICK
========================================= */

self.addEventListener(
  "notificationclick",

  (event) => {
    event.notification.close();

    event.waitUntil(
      (async () => {
        const data = event.notification.data || {};
        const suppliedUrl = data.url || "/blog/feed/1";

        let targetUrl;

        try {
          targetUrl = new URL(suppliedUrl, self.location.origin);

          if (targetUrl.origin !== self.location.origin) {
            targetUrl = new URL("/blog/feed/1", self.location.origin);
          }
        } catch {
          targetUrl = new URL("/blog/feed/1", self.location.origin);
        }

        const pushType = data.type || "general";
        const campaign = data.campaign || pushType;
        const pushId = data.pushId || event.notification.tag || "";

        targetUrl.searchParams.set("utm_source", "tech_path");
        targetUrl.searchParams.set("utm_medium", "web_push");
        targetUrl.searchParams.set("utm_campaign", campaign);
        targetUrl.searchParams.set("push_type", pushType);
        targetUrl.searchParams.set("push_campaign", campaign);

        if (pushId) {
          targetUrl.searchParams.set("utm_content", pushId);
          targetUrl.searchParams.set("push_id", pushId);
        }

        const windows = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of windows) {
          try {
            const clientUrl = new URL(client.url);

            if (clientUrl.origin === self.location.origin) {
              await client.focus();

              if ("navigate" in client) {
                await client.navigate(targetUrl.href);
              }

              return;
            }
          } catch {
            // Continue to the next client.
          }
        }

        await self.clients.openWindow(targetUrl.href);
      })(),
    );
  },
);

/* =========================================
   FETCH
========================================= */

self.addEventListener(
  "fetch",

  (event) => {
    const request = event.request;

    if (request.method !== "GET") {
      return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
      return;
    }

    /* =====================================
       NEVER CACHE
    ===================================== */

    if (
      url.pathname === "/sw.js" ||
      url.pathname === "/manifest.webmanifest" ||
      url.pathname === "/manifest.json" ||
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/auth/") ||
      url.pathname.startsWith("/admin/")
    ) {
      return;
    }

    /* =====================================
       HTML NAVIGATION — NETWORK FIRST
    ===================================== */

    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();

              void caches.open(PAGE_CACHE).then((cache) =>
                cache.put(
                  request,

                  copy,
                ),
              );
            }

            return response;
          })
          .catch(async () => {
            const cached = await caches.match(request);

            if (cached) {
              return cached;
            }

            return new Response(
              `
                  <!doctype html>

                  <html lang="en">
                    <head>
                      <meta charset="utf-8" />

                      <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                      />

                      <title>Tech Path — Offline</title>
                    </head>

                    <body
                      style="
                        font-family: system-ui, sans-serif;
                        max-width: 620px;
                        margin: 80px auto;
                        padding: 24px;
                        text-align: center;
                      "
                    >
                      <h1>You're offline</h1>

                      <p>
                        Tech Path could not connect to the internet.
                      </p>

                      <button
                        onclick="location.reload()"
                        style="
                          padding: 12px 20px;
                          border: 0;
                          border-radius: 10px;
                          cursor: pointer;
                        "
                      >
                        Try again
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

    /* =====================================
       NEXT STATIC — CACHE FIRST
    ===================================== */

    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(
        caches.match(request).then(async (cached) => {
          if (cached) {
            return cached;
          }

          const response = await fetch(request);

          if (response && response.ok) {
            const copy = response.clone();

            const cache = await caches.open(STATIC_CACHE);

            await cache.put(
              request,

              copy,
            );
          }

          return response;
        }),
      );

      return;
    }

    /* =====================================
       IMAGES — STALE WHILE REVALIDATE
    ===================================== */

    if (request.destination === "image") {
      event.respondWith(
        caches.match(request).then((cached) => {
          const network = fetch(request)
            .then((response) => {
              if (response && response.ok) {
                const copy = response.clone();

                void caches.open(IMAGE_CACHE).then((cache) =>
                  cache.put(
                    request,

                    copy,
                  ),
                );
              }

              return response;
            })
            .catch(() => cached);

          return cached || network;
        }),
      );
    }
  },
);
