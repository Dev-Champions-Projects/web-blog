"use client";

import {
  BellRing,
  Check,
  Megaphone,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { tags as availableTags } from "@/lib/tags";

export type BlogAlertPreferencesValue = {
  newPosts: boolean;
  specialAnnouncements: boolean;
  learningReminders: boolean;
  tags: string[];
};

export const DEFAULT_BLOG_ALERT_PREFERENCES: BlogAlertPreferencesValue = {
  newPosts: true,
  specialAnnouncements: true,
  learningReminders: true,
  tags: [],
};

type Props = {
  endpoint?: string | null;
  initialPreferences: BlogAlertPreferencesValue;
  onClose: () => void;
  onSaved: (preferences: BlogAlertPreferencesValue) => void;
  mode?: "manage" | "onboarding";
  onEnable?: (preferences: BlogAlertPreferencesValue) => Promise<void>;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
        checked
          ? "bg-[#5A1C4B] dark:bg-[#409FB6]"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function BlogAlertPreferences({
  endpoint = null,
  initialPreferences,
  onClose,
  onSaved,
  mode = "manage",
  onEnable,
}: Props) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function keyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", keyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", keyDown);
    };
  }, [onClose]);

  function toggleTag(tag: string) {
    setPreferences((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((value) => value !== tag)
        : [...current.tags, tag],
    }));
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      if (mode === "onboarding") {
        if (!onEnable) {
          throw new Error("Notification onboarding is not available.");
        }

        await onEnable(preferences);
        onSaved(preferences);
        onClose();
        return;
      }

      if (!endpoint) {
        throw new Error("Push subscription not found.");
      }

      const response = await fetch("/api/push/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          ...preferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save alert preferences.");
      }

      onSaved(data.preferences);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save alert preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  const topics = availableTags.filter((tag) => tag !== "All");
  const onboarding = mode === "onboarding";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tech-path-alert-settings"
        className="flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-3xl dark:bg-slate-950"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-7 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5A1C4B] dark:text-[#7fd2eb]">
              Tech Path Alerts
            </p>

            <h2
              id="tech-path-alert-settings"
              className="mt-1 text-xl font-bold text-slate-950 dark:text-white"
            >
              {onboarding ? "Stay connected to Tech Path" : "Personalize your alerts"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {onboarding
                ? "Choose what should bring you back, then enable notifications on this device."
                : "Choose what Tech Path should notify you about."}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex gap-3">
                <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#5A1C4B] dark:text-[#7fd2eb]" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">New articles</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Notify me when a matching Tech Path article is first published.
                  </p>
                </div>
              </div>

              <Toggle
                checked={preferences.newPosts}
                onChange={() =>
                  setPreferences((current) => ({
                    ...current,
                    newPosts: !current.newPosts,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex gap-3">
                <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-[#5A1C4B] dark:text-[#7fd2eb]" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Special announcements
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Product updates and important Tech Path announcements.
                  </p>
                </div>
              </div>

              <Toggle
                checked={preferences.specialAnnouncements}
                onChange={() =>
                  setPreferences((current) => ({
                    ...current,
                    specialAnnouncements: !current.specialAnnouncements,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#5A1C4B] dark:text-[#7fd2eb]" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Learning reminders
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    If you have been away, send a useful reminder after about 7 days and one final reminder around day 14.
                  </p>
                </div>
              </div>

              <Toggle
                checked={preferences.learningReminders}
                onChange={() =>
                  setPreferences((current) => ({
                    ...current,
                    learningReminders: !current.learningReminders,
                  }))
                }
              />
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">Topics</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Select topics you care about. Leave everything unselected to receive articles from all topics.
                </p>
              </div>

              {preferences.tags.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreferences((current) => ({
                      ...current,
                      tags: [],
                    }))
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#5A1C4B] dark:text-[#7fd2eb]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  All topics
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {topics.map((tag) => {
                const selected = preferences.tags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
                      selected
                        ? "border-[#5A1C4B] bg-[#5A1C4B] text-white dark:border-[#409FB6] dark:bg-[#409FB6] dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#5A1C4B]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="rounded-2xl bg-[#5A1C4B]/5 p-4 dark:bg-[#409FB6]/10">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5A1C4B] dark:text-[#7fd2eb]">
              Your alert profile
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {!preferences.newPosts
                ? "New article notifications are off."
                : preferences.tags.length === 0
                  ? "You'll receive new article alerts from all Tech Path topics."
                  : `You'll receive new articles matching: ${preferences.tags.join(", ")}.`}
              {preferences.learningReminders
                ? " Learning reminders are on."
                : " Learning reminders are off."}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold"
          >
            {onboarding ? "Not now" : "Cancel"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="min-h-11 rounded-xl bg-[#5A1C4B] px-5 text-sm font-bold text-white disabled:opacity-60 dark:bg-[#409FB6] dark:text-slate-950"
          >
            {saving
              ? onboarding
                ? "Enabling..."
                : "Saving..."
              : onboarding
                ? "Enable Alerts"
                : "Save Preferences"}
          </button>
        </footer>
      </section>
    </div>
  );
}
