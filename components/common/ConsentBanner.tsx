"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "devChampionsConsent";

export default function ConsentBanner() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setAccepted(stored === "accepted");
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    setAccepted(true);
  };

  const handleDecline = () => {
    window.localStorage.setItem(STORAGE_KEY, "declined");
    setAccepted(false);
  };

  if (accepted !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950 text-white shadow-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-medium">
            We use analytics to improve Dev Champions and make this site better
            for you.
          </p>
          <p className="mt-1 text-sm text-slate-300">
            By accepting, you agree that anonymous usage data may be collected
            to improve content, navigation, and service offerings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDecline}
            className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-xl bg-[#5A1C4B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#409FB6]"
          >
            Accept and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
