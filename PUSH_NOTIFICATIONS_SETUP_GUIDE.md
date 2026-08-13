# Push Notifications Setup Guide

This document captures the work needed to enable browser push notifications for users who install the PWA on their device.

## Goal

Allow subscribed users to receive push notifications even when the app is not open, as long as they have the app installed and have granted notification permission.

## Important requirements

Push notifications for web apps require all of the following:

- the app is installed as a PWA or running on HTTPS/localhost
- the browser supports Web Push
- the user grants notification permission
- the service worker handles `push` events
- a backend stores each user’s subscription and sends messages through a VAPID-enabled push server

This project already has a basic service worker registered, but it does not yet include the push subscription flow, VAPID setup, or push sending logic.

---

## 1. Install the push library

Add the package you will use on the server side:

```bash
npm install web-push
```

You may also want the package in dev dependencies if the project uses a server-side script for generating keys.

---

## 2. Generate VAPID keys

Generate a VAPID keypair locally:

```bash
npx web-push generate-vapid-keys
```

This prints output similar to:

```bash
Public Key:
Private Key:
```

Store them in `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:hello@yourdomain.com
```

Notes:

- `VAPID_SUBJECT` should be a contact email or URL
- Use the production domain when deploying
- Never expose the private key to the browser

---

## 3. Update the service worker to handle push

The current service worker at `public/sw.js` is responsible for caching. It also needs push support.

Add logic like this:

```js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {
    title: "Tech Path",
    body: "You have a new notification",
    url: "/blog/feed/1",
  };

  const options = {
    body: data.body,
    icon: "/favicon.jpg",
    badge: "/favicon.jpg",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        const existingClient = clientsArr.find((client) => "focus" in client);
        if (existingClient) {
          return existingClient.navigate(url);
        }
        return clients.openWindow(url);
      }),
  );
});
```

This makes the installed app display browser notifications and open a route when the user clicks them.

---

## 4. Add a client-side permission flow

On the app side, add a section or button that triggers subscription only after the user explicitly agrees.

Example flow:

```ts
if ("serviceWorker" in navigator && "PushManager" in window) {
  const registration = await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    ),
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  });
}
```

You will also need a helper like this:

```ts
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}
```

---

## 5. Create a backend subscription route

Create a route such as:

- `/api/push/subscribe`
- `/api/push/unsubscribe`

The POST route should do the following:

- read the subscription body
- validate the request
- get the logged-in user id if available
- persist endpoint, p256dh, auth, and user id
- avoid duplicate subscriptions

Example database fields to store:

```ts
endpoint;
p256dh;
auth;
userId;
createdAt;
```

If the project uses Prisma, add a model like:

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String?
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
}
```

Then run:

```bash
npx prisma generate
npx prisma db push
```

---

## 6. Send push notifications from the server

Create a helper that uses `web-push` to send notifications to all stored subscriptions.

Example:

```ts
import webPush from "web-push";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:hello@yourdomain.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

await webPush.sendNotification(
  subscription,
  JSON.stringify({
    title: "New post published",
    body: "A new post is now live on Tech Path",
    url: "/blog/feed/1",
  }),
);
```

Use this from:

- a server action
- a route handler
- a scheduled task
- a notification trigger when a user follows, comments, or gets a new update

---

## 7. Security and browser rules

Keep the following in mind:

- Push notifications only work on `https://` or `localhost`
- Browsers ignore push without a valid service worker
- You must have user permission before sending push messages
- Subscription data is sensitive and should be stored securely
- Browser subscription tokens can change; refresh them when needed

---

## Manifest & DevTools checks

When developing PWAs, use Chrome/Edge DevTools (Application tab) to inspect the manifest and service worker. The screenshots you provided show common issues — here's how to interpret and fix them.

- Richer PWA Install UI won't be available: add at least one screenshot in the manifest. For desktop, include a screenshot with `form_factor` set to `wide`. For mobile, include a screenshot either without `form_factor` or with a value other than `wide`.
- Icon failed to load: ensure every `src` path in `public/manifest.json` exists and is served from `/public`. Example: `/icons/pwa-icon.svg` must be present at `public/icons/pwa-icon.svg`.
- Actual size mismatch (e.g. Actual size (18×16)px does not match specified size (192×192)px): this means the file you're referencing is smaller than the declared `sizes`. Fix by providing raster icons with the exact pixel dimensions.

Recommended icon set (place files under `public/icons/`):

- `icon-192.png` — 192x192 (type: `image/png`)
- `icon-512.png` — 512x512 (type: `image/png`)
- `pwa-icon.svg` — optional SVG for scalable use; also include a `maskable` PNG if you use `purpose: "maskable"`

Example `icons` block for `public/manifest.json`:

```json
"icons": [
  { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
  { "src": "/icons/pwa-icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "maskable any" }
]
```

- App identity / Computed App ID: DevTools may show a computed App ID based on `start_url`. If you need a stable app id that matches a particular identity, add an `id` field to the manifest or ensure `start_url` is `/`.

DevTools service worker checks and push testing:

- Open `Application → Service workers` to confirm your worker is `activated and is running`.
- Use the `Push` test button in DevTools to simulate an incoming push. Provide a JSON payload similar to the server-sent payload:

```json
{ "title": "Test push", "body": "This is a test", "url": "/blog/feed/1" }
```

- If the service worker is active and your `push` handler shows notifications, you should see the notification immediately when you click `Push` in DevTools. Click the notification to verify `notificationclick` handling navigates to the expected route.

Quick fixes summary:

- Add correctly sized PNG icon files and reference them in `manifest.json`.
- Include a `maskable` icon if you want platform-specific masking to look correct.
- Add screenshots for richer install UI (desktop `form_factor: "wide"` and mobile screenshots).
- Ensure paths are absolute (start with `/`) and files are under `public/`.

## 8. Free Neon + Render setup

This is the lowest-cost setup for your project stack:

- Neon stores the push subscriptions
- Render hosts the app that sends notifications
- `web-push` handles the browser push protocol
- VAPID keys authenticate the server to the browser

This is free in platform fees, but not free in engineering time.

### Why this works well for your stack

- Neon already gives you a database for storing subscription data
- Render can host your API routes and background sending logic
- The browser push API itself is free to use
- You do not need a paid notification vendor to get started

### Reality check

The Render free tier can work, but it may sleep and cause delayed or inconsistent delivery. For production reliability, a paid always-on Render plan is better. But for a free MVP or prototype, this setup is realistic and workable.

### Recommended production environment variables

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:hello@yourdomain.com
DATABASE_URL=...
NEXTAUTH_URL=https://yourdomain.com
AUTH_SECRET=...
```

---

## 9. Production deployment notes

When deploying to production:

- set the real domain in `VAPID_SUBJECT`
- ensure the service worker is served from `/sw.js`
- ensure the site is behind HTTPS
- verify the manifest and app install flow still works after deployment
- confirm notifications are enabled on the target browsers
- keep the Render app awake enough to send notifications reliably

Typical production env values:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:hello@yourdomain.com
```

---

## 10. Recommended implementation order

1. Add VAPID keys and env vars
2. Extend `public/sw.js` for `push` and `notificationclick`
3. Add a client helper to subscribe users
4. Add `/api/push/subscribe` route
5. Add database model for stored subscriptions
6. Add a push sender helper
7. Trigger it when relevant app events happen
8. Test on Chrome and Safari behavior differences

---

## 11. Daily checklist before enabling in production

- [ ] user has installed the PWA
- [ ] browser permission is granted
- [ ] service worker is registered successfully
- [ ] subscription is saved to the backend
- [ ] push sender can deliver a test notification
- [ ] notification click opens the correct page
- [ ] unauthenticated/expired subscriptions are cleaned up

---

## 12. Useful next implementation files

Likely files to update later:

- `public/sw.js`
- `app/layout.tsx`
- `components/pwa/InstallPWAButton.tsx`
- `components/pwa/RegisterServiceWorker.tsx`
- a new `app/api/push/*` route group
- a Prisma model for stored subscriptions

This guide is intentionally designed so the project can be completed in a future session without re-discovering the Web Push architecture from scratch.
