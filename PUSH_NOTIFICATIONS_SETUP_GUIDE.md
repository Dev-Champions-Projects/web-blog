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

## 8. Production deployment notes

When deploying to production:

- set the real domain in `VAPID_SUBJECT`
- ensure the service worker is served from `/sw.js`
- ensure the site is behind HTTPS
- verify the manifest and app install flow still works after deployment
- confirm notifications are enabled on the target browsers

Typical production env values:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:hello@yourdomain.com
```

---

## 9. Recommended implementation order

1. Add VAPID keys and env vars
2. Extend `public/sw.js` for `push` and `notificationclick`
3. Add a client helper to subscribe users
4. Add `/api/push/subscribe` route
5. Add database model for stored subscriptions
6. Add a push sender helper
7. Trigger it when relevant app events happen
8. Test on Chrome and Safari behavior differences

---

## 10. Daily checklist before enabling in production

- [ ] user has installed the PWA
- [ ] browser permission is granted
- [ ] service worker is registered successfully
- [ ] subscription is saved to the backend
- [ ] push sender can deliver a test notification
- [ ] notification click opens the correct page
- [ ] unauthenticated/expired subscriptions are cleaned up

---

## Useful next implementation files

Likely files to update later:

- `public/sw.js`
- `app/layout.tsx`
- `components/pwa/InstallPWAButton.tsx`
- `components/pwa/RegisterServiceWorker.tsx`
- a new `app/api/push/*` route group
- a Prisma model for stored subscriptions

This guide is intentionally designed so the project can be completed in a future session without re-discovering the Web Push architecture from scratch.
