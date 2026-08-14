"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Explicitly check for a newer service worker.
        await registration.update();

        console.log("Tech Path service worker registered:", registration.scope);
      } catch (error) {
        console.warn("Tech Path service worker registration failed:", error);
      }
    };

    const handleControllerChange = () => {
      if (refreshing) {
        return;
      }

      refreshing = true;

      // Reload once so the page and new worker use the same version.
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    registerServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return null;
}
