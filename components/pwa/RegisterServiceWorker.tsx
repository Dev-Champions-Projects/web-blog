"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn(
        "Tech Path PWA: Service workers are not supported in this browser.",
      );

      return;
    }

    /*
     * Keep service workers away from
     * normal Next.js development mode.
     *
     * Use:
     *
     * npm run build
     * npm start
     *
     * for local PWA testing.
     */

    if (process.env.NODE_ENV !== "production") {
      console.info(
        "Tech Path PWA: service worker skipped in development mode.",
      );

      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register(
          "/sw.js",

          {
            scope: "/",

            updateViaCache: "none",
          },
        );

        if (cancelled) {
          return;
        }

        console.info("Tech Path service worker registered:", {
          scope: registration.scope,

          active: registration.active?.state || null,

          waiting: registration.waiting?.state || null,

          installing: registration.installing?.state || null,
        });

        /*
         * Always check the server for
         * a newer sw.js.
         */

        await registration.update();

        /*
         * Log worker transitions.
         */

        registration.addEventListener(
          "updatefound",

          () => {
            const worker = registration.installing;

            if (!worker) {
              return;
            }

            worker.addEventListener(
              "statechange",

              () => {
                console.info("Tech Path service worker state:", worker.state);
              },
            );
          },
        );
      } catch (error) {
        console.error("Tech Path service worker registration failed:", error);
      }
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
