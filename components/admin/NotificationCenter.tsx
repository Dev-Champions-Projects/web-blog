"use client";

import { useMemo, useState } from "react";

import { BellRing, Send } from "lucide-react";

import { tags as availableTags } from "@/lib/tags";

type Delivery = {
  enabled: number;

  matched: number;

  inAppRecipients: number;

  attempted: number;

  delivered: number;

  failed: number;

  removed: number;
};

export default function NotificationCenter() {
  const [title, setTitle] = useState("");

  const [message, setMessage] = useState("");

  const [url, setUrl] = useState("/blog/feed/1");

  const [targetTag, setTargetTag] = useState("");

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const topics = useMemo(
    () => availableTags.filter((tag) => tag !== "All"),

    [],
  );

  async function sendNotification() {
    setSending(true);

    setError("");

    setDelivery(null);

    try {
      const confirmed = window.confirm("Send this notification now?");

      if (!confirmed) {
        return;
      }

      const response = await fetch(
        "/api/admin/notifications",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title,

            message,

            url,

            targetTag,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send notification.");
      }

      setDelivery(data.delivery);

      setTitle("");

      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to send notification.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-950 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5A1C4B]/10 text-[#5A1C4B]">
            <BellRing className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Tech Path Notification Center
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Send important notifications to readers based on their alert
              preferences.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold">Title</span>

            <input
              value={title}
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="Tech Path update"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Message</span>

            <textarea
              value={message}
              maxLength={240}
              rows={4}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="Tell readers what is new..."
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Click destination</span>

            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="/blog/feed/1"
            />

            <p className="mt-1 text-xs text-slate-500">
              Example: /blog/feed/1 or a specific article URL.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Audience</span>

            <select
              value={targetTag}
              onChange={(event) => setTargetTag(event.target.value)}
              className="mt-2 w-full rounded-xl border bg-white px-4 py-3 dark:bg-slate-950"
            >
              <option value="">All special-announcement subscribers</option>

              {topics.map((tag) => (
                <option value={tag} key={tag}>
                  {tag} readers
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {delivery && (
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Matched devices</p>

                <p className="text-xl font-bold">{delivery.matched}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Push delivered</p>

                <p className="text-xl font-bold">{delivery.delivered}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Bell users</p>

                <p className="text-xl font-bold">{delivery.inAppRecipients}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Failed</p>

                <p className="text-xl font-bold">{delivery.failed}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={sending || !title.trim() || !message.trim()}
            onClick={() => void sendNotification()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#5A1C4B] px-6 font-bold text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />

            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}
