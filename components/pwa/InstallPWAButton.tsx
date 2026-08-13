"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, MonitorDown, Share, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "ios" | "mac-safari" | "android" | "desktop" | "other";

function isStandalone() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (platform === "MacIntel" && maxTouchPoints > 1);
  if (isIOS) return "ios";

  const isAndroid = /Android/i.test(ua);
  if (isAndroid) return "android";

  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg/i.test(ua);
  if (isMac && isSafari) return "mac-safari";

  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) return "desktop";
  return "other";
}

export default function InstallPWAButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    setInstalled(isStandalone());
    setPlatform(detectPlatform());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const handleDisplayMode = () => setInstalled(isStandalone());
    displayMode.addEventListener?.("change", handleDisplayMode);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener?.("change", handleDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    setShowHelp(true);
  }, [deferredPrompt]);

  const help = useMemo(() => {
    if (platform === "ios") {
      return {
        icon: Share,
        title: "Install Open Tech Path App on iPhone or iPad",
        steps: [
          "Open Open Tech Path App in Safari.",
          "Tap the Share button.",
          "Choose Add to Home Screen, then confirm Add.",
          "Launch Open Tech Path App from your Home Screen like a normal app.",
        ],
      };
    }

    if (platform === "mac-safari") {
      return {
        icon: MonitorDown,
        title: "Install Open Tech Path App on Mac",
        steps: [
          "Open Open Tech Path App in Safari.",
          "Choose File → Add to Dock.",
          "Confirm the app name and select Add.",
          "Launch Open Tech Path App from the Dock, Applications, or Spotlight.",
        ],
      };
    }

    if (platform === "android") {
      return {
        icon: Smartphone,
        title: "Install Open Tech Path App on Android",
        steps: [
          "Open the browser menu (usually ⋮).",
          "Choose Install app or Add to Home screen.",
          "Confirm Install.",
          "Launch Open Tech Path App from your app list or Home Screen.",
        ],
      };
    }

    return {
      icon: MonitorDown,
      title: "Install Open Tech Path App",
      steps: [
        "Look for the Install icon in your browser address bar or menu.",
        "Choose Install Open Tech Path App / Install app.",
        "Confirm the installation.",
        "Launch Open Tech Path App from your desktop app launcher or Start menu.",
      ],
    };
  }, [platform]);

  if (installed) return null;

  const HelpIcon = help.icon;

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#5A1C4B]/20 bg-[#5A1C4B] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#409FB6] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#409FB6] focus:ring-offset-2 dark:border-[#409FB6]/30 dark:bg-[#409FB6] dark:text-slate-950 dark:hover:bg-[#7fd2eb]",
          compact && "w-10 px-0 sm:w-auto sm:px-3",
          className,
        )}
        aria-label="Install Open Tech Path App"
        title="Install Open Tech Path App"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span className={compact ? "hidden sm:inline" : undefined}>
          Install App
        </span>
      </button>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md rounded-2xl border-[#5A1C4B]/10 bg-white dark:border-[#409FB6]/20 dark:bg-slate-900">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#5A1C4B]/10 text-[#5A1C4B] dark:bg-[#409FB6]/15 dark:text-[#7fd2eb]">
              <HelpIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <DialogTitle className="text-[#5A1C4B] dark:text-[#7fd2eb]">
              {help.title}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              Open Tech Path App can run in its own window and be opened
              directly from your device.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-3 pt-2 text-sm text-slate-700 dark:text-slate-200">
            {help.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5A1C4B] text-xs font-bold text-white dark:bg-[#409FB6] dark:text-slate-950">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          {platform === "ios" && (
            <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              On iPhone and iPad, Open Tech Path App can be added to the Home
              Screen for quick access and a native feel.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
