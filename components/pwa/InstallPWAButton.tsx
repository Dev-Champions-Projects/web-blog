"use client";

import Image from "next/image";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Download,
  MonitorDown,
  Share,
  Smartphone,
  X,
} from "lucide-react";

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

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";

    platform: string;
  }>;
};

type Platform = "ios" | "android" | "mac-safari" | "desktop" | "other";

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent;

  const platform = navigator.platform;

  const maxTouchPoints = navigator.maxTouchPoints || 0;

  /*
   * iPadOS sometimes identifies
   * itself as macOS.
   */
  const ios =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1);

  if (ios) {
    return "ios";
  }

  if (/Android/i.test(userAgent)) {
    return "android";
  }

  const mac = /Macintosh|Mac OS X/i.test(userAgent);

  const safari =
    /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg/i.test(userAgent);

  if (mac && safari) {
    return "mac-safari";
  }

  if (/Windows|Macintosh|Linux|CrOS/i.test(userAgent)) {
    return "desktop";
  }

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

  const [dialogOpen, setDialogOpen] = useState(false);

  const [platform, setPlatform] = useState<Platform>("other");

  const [installing, setInstalling] = useState(false);

  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    setPlatform(detectPlatform());

    function handleBeforeInstallPrompt(event: Event) {
      /*
       * Stop Chrome from showing
       * its own prompt immediately.
       *
       * We trigger it from our
       * branded Tech Path UI instead.
       */

      event.preventDefault();

      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);

      setDeferredPrompt(null);

      setDialogOpen(false);

      setInstalling(false);
    }

    window.addEventListener(
      "beforeinstallprompt",

      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",

      handleInstalled,
    );

    const displayMode = window.matchMedia("(display-mode: standalone)");

    function handleDisplayMode() {
      setInstalled(isStandalone());
    }

    displayMode.addEventListener?.(
      "change",

      handleDisplayMode,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",

        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",

        handleInstalled,
      );

      displayMode.removeEventListener?.(
        "change",

        handleDisplayMode,
      );
    };
  }, []);

  const instructions = useMemo(() => {
    if (platform === "ios") {
      return {
        icon: Share,

        heading: "Add Tech Path to your Home Screen",

        introduction:
          "Safari on iPhone and iPad installs web apps through the Share menu.",

        steps: [
          "Open Tech Path in Safari.",
          "Tap the Share button in Safari.",
          "Scroll and select Add to Home Screen.",
          "Tap Add to install Tech Path.",
        ],
      };
    }

    if (platform === "mac-safari") {
      return {
        icon: MonitorDown,

        heading: "Install Tech Path on your Mac",

        introduction:
          "Safari can add Tech Path directly to your Dock and Applications.",

        steps: [
          "Keep Tech Path open in Safari.",
          "Choose File from the Safari menu.",
          "Choose Add to Dock.",
          "Confirm by selecting Add.",
        ],
      };
    }

    if (platform === "android") {
      return {
        icon: Smartphone,

        heading: "Install Tech Path on Android",

        introduction: "Install Tech Path so it can launch like a normal app.",

        steps: [
          "Open the browser menu (⋮).",
          "Choose Install app or Add to Home screen.",
          "Confirm the installation.",
          "Open Tech Path from your Home Screen or app list.",
        ],
      };
    }

    return {
      icon: MonitorDown,

      heading: "Install Tech Path",

      introduction: "Install Tech Path for faster access from your computer.",

      steps: [
        "Open your browser menu.",
        "Look for Install Tech Path or Install app.",
        "Confirm the installation.",
        "Launch Tech Path from your Start menu, Dock or app launcher.",
      ],
    };
  }, [platform]);

  const ManualIcon = instructions.icon;

  const openInstallDialog = useCallback(() => {
    setInstallDismissed(false);

    setDialogOpen(true);
  }, []);

  const triggerInstall = useCallback(async () => {
    /*
     * Chrome / Edge / Android
     * may provide the native
     * beforeinstallprompt event.
     */

    if (deferredPrompt) {
      setInstalling(true);

      try {
        await deferredPrompt.prompt();

        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
          setInstalled(true);

          setDialogOpen(false);
        } else {
          setInstallDismissed(true);
        }

        setDeferredPrompt(null);
      } finally {
        setInstalling(false);
      }

      return;
    }

    /*
     * Safari/iOS and browsers
     * without beforeinstallprompt
     * use the instructions already
     * displayed in the dialog.
     */

    setInstallDismissed(true);
  }, [deferredPrompt]);

  if (installed) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={openInstallDialog}
        aria-label="Install Tech Path"
        title="Install Tech Path"
        className={cn(
          "group inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#5A1C4B]/15 bg-[#5A1C4B] px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6d255c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#409FB6] focus:ring-offset-2 dark:border-[#7fd2eb]/20 dark:bg-[#409FB6] dark:text-slate-950 dark:hover:bg-[#65bfd5]",

          compact && "w-10 px-0 sm:w-auto sm:px-3",

          className,
        )}
      >
        <Download
          className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />

        <span className={compact ? "hidden sm:inline" : undefined}>
          Install
        </span>
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="
      flex
      max-h-[calc(100dvh-1rem)]
      w-[calc(100vw-1rem)]
      max-w-none
      flex-col
      gap-0
      overflow-hidden
      rounded-2xl
      border
      border-[#5A1C4B]/10
      bg-white
      p-0
      shadow-2xl

      sm:max-h-[90dvh]
      sm:w-full
      sm:max-w-lg
      sm:rounded-3xl

      dark:border-[#409FB6]/20
      dark:bg-slate-950
    "
        >
          {/*
           * ==================================
           * HEADER / HERO
           * ==================================
           */}

          <div
            className="
        relative
        shrink-0
        overflow-hidden
        border-b
        border-slate-100
        bg-gradient-to-br
        from-[#fff8fc]
        via-white
        to-[#eefafe]
        px-4
        pb-4
        pt-5

        sm:px-7
        sm:pb-6
        sm:pt-7

        dark:border-slate-800
        dark:from-[#261220]
        dark:via-slate-950
        dark:to-[#10242a]
      "
          >
            <div
              aria-hidden="true"
              className="
          absolute
          -right-20
          -top-24
          h-52
          w-52
          rounded-full
          bg-[#409FB6]/10
          blur-3xl
        "
            />

            <div
              aria-hidden="true"
              className="
          absolute
          -bottom-24
          -left-16
          h-48
          w-48
          rounded-full
          bg-[#5A1C4B]/10
          blur-3xl
        "
            />

            <DialogHeader className="relative pr-8">
              <div
                className="
            flex
            items-start
            gap-3

            sm:gap-4
          "
              >
                <div
                  className="
              relative
              h-14
              w-14
              shrink-0
              overflow-hidden
              rounded-2xl
              border
              border-white
              bg-white
              shadow-md

              sm:h-[76px]
              sm:w-[76px]
              sm:shadow-lg
            "
                >
                  <Image
                    src="/icons/icon-192.png"
                    alt="Tech Path app icon"
                    fill
                    sizes="(max-width: 640px) 56px, 76px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div
                    className="
                mb-1.5
                inline-flex
                items-center
                rounded-full
                border
                border-[#5A1C4B]/10
                bg-white/80
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#5A1C4B]

                sm:text-[10px]

                dark:border-[#409FB6]/20
                dark:bg-slate-900/80
                dark:text-[#7fd2eb]
              "
                  >
                    Tech Path
                  </div>

                  <DialogTitle
                    className="
                text-left
                text-xl
                font-bold
                leading-tight
                text-slate-950

                sm:text-2xl

                dark:text-white
              "
                  >
                    Take Tech Path with you
                  </DialogTitle>

                  <DialogDescription
                    className="
                mt-1
                text-left
                text-xs
                leading-5
                text-slate-600

                sm:mt-1.5
                sm:text-sm
                sm:leading-6

                dark:text-slate-300
              "
                  >
                    Install the blog for quick access to tutorials, programming
                    guides and developer insights.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/*
           * ==================================
           * SCROLLABLE CONTENT
           * ==================================
           */}

          <div
            className="
        min-h-0
        flex-1
        overflow-y-auto
        overscroll-contain
        px-4
        py-4

        sm:px-7
        sm:py-6
      "
          >
            <div className="space-y-5">
              {/*
               * ==================================
               * BENEFITS
               * ==================================
               */}

              <div
                className="
            grid
            grid-cols-1
            gap-2.5

            sm:grid-cols-3
            sm:gap-3
          "
              >
                <div
                  className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-3

              dark:border-slate-800
              dark:bg-slate-900
            "
                >
                  <CheckCircle2
                    className="
                h-5
                w-5
                text-[#5A1C4B]

                dark:text-[#7fd2eb]
              "
                    aria-hidden="true"
                  />

                  <p
                    className="
                mt-2
                text-sm
                font-bold
                text-slate-900

                dark:text-white
              "
                  >
                    Quick access
                  </p>

                  <p
                    className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
                  >
                    Open Tech Path directly from your device.
                  </p>
                </div>

                <div
                  className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-3

              dark:border-slate-800
              dark:bg-slate-900
            "
                >
                  <Smartphone
                    className="
                h-5
                w-5
                text-[#5A1C4B]

                dark:text-[#7fd2eb]
              "
                    aria-hidden="true"
                  />

                  <p
                    className="
                mt-2
                text-sm
                font-bold
                text-slate-900

                dark:text-white
              "
                  >
                    App experience
                  </p>

                  <p
                    className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
                  >
                    Runs in its own clean standalone window.
                  </p>
                </div>

                <div
                  className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-3

              dark:border-slate-800
              dark:bg-slate-900
            "
                >
                  <Download
                    className="
                h-5
                w-5
                text-[#5A1C4B]

                dark:text-[#7fd2eb]
              "
                    aria-hidden="true"
                  />

                  <p
                    className="
                mt-2
                text-sm
                font-bold
                text-slate-900

                dark:text-white
              "
                  >
                    Easy install
                  </p>

                  <p
                    className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
                  >
                    No app store account is required.
                  </p>
                </div>
              </div>

              {/*
               * ==================================
               * NATIVE INSTALL READY
               * ==================================
               */}

              {deferredPrompt && (
                <div
                  className="
              rounded-2xl
              border
              border-[#409FB6]/25
              bg-[#409FB6]/5
              p-4

              dark:bg-[#409FB6]/10
            "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#409FB6]/15
                  text-[#287f95]

                  dark:text-[#7fd2eb]
                "
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                    text-sm
                    font-bold
                    text-slate-900

                    dark:text-white
                  "
                      >
                        Ready to install
                      </p>

                      <p
                        className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-600

                    dark:text-slate-300
                  "
                      >
                        Your browser supports direct installation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/*
               * ==================================
               * MANUAL INSTALL
               * ==================================
               */}

              {!deferredPrompt && (
                <div
                  className="
              rounded-2xl
              border
              border-slate-200
              p-4

              dark:border-slate-800
            "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#5A1C4B]/10
                  text-[#5A1C4B]

                  dark:bg-[#409FB6]/15
                  dark:text-[#7fd2eb]
                "
                    >
                      <ManualIcon className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                    text-sm
                    font-bold
                    text-slate-900

                    dark:text-white
                  "
                      >
                        {instructions.heading}
                      </p>

                      <p
                        className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500

                    dark:text-slate-400
                  "
                      >
                        {instructions.introduction}
                      </p>
                    </div>
                  </div>

                  <ol className="mt-4 space-y-3">
                    {instructions.steps.map((step, index) => (
                      <li
                        key={step}
                        className="
                      flex
                      items-start
                      gap-3
                      text-sm
                      leading-5
                      text-slate-700

                      dark:text-slate-200
                    "
                      >
                        <span
                          className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#5A1C4B]
                        text-[11px]
                        font-bold
                        text-white

                        dark:bg-[#409FB6]
                        dark:text-slate-950
                      "
                        >
                          {index + 1}
                        </span>

                        <span className="min-w-0 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {installDismissed && deferredPrompt === null && (
                <p
                  className="
                rounded-xl
                bg-slate-100
                px-4
                py-3
                text-xs
                leading-5
                text-slate-600

                dark:bg-slate-900
                dark:text-slate-300
              "
                >
                  If your browser does not display an installation prompt, use
                  its menu and choose <strong>Install app</strong> or{" "}
                  <strong>Add to Home Screen</strong>.
                </p>
              )}
            </div>
          </div>

          {/*
           * ==================================
           * STICKY FOOTER
           * ==================================
           */}

          <div
            className="
        shrink-0
        border-t
        border-slate-100
        bg-white/95
        px-4
        py-3
        backdrop-blur

        sm:px-7
        sm:py-4

        dark:border-slate-800
        dark:bg-slate-950/95
      "
          >
            <div
              className="
          flex
          flex-col-reverse
          gap-2.5

          sm:flex-row
          sm:justify-end
          sm:gap-3
        "
            >
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="
            inline-flex
            min-h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:bg-slate-50

            sm:w-auto

            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-200
            dark:hover:bg-slate-800
          "
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Not now
              </button>

              <button
                type="button"
                disabled={installing}
                onClick={
                  deferredPrompt ? triggerInstall : () => setDialogOpen(false)
                }
                className="
            inline-flex
            min-h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#5A1C4B]
            px-5
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-[#6d255c]
            disabled:cursor-not-allowed
            disabled:opacity-60

            sm:w-auto

            dark:bg-[#409FB6]
            dark:text-slate-950
            dark:hover:bg-[#65bfd5]
          "
              >
                {platform === "ios" ? (
                  <Share className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}

                {installing
                  ? "Installing..."
                  : deferredPrompt
                    ? "Install Tech Path"
                    : "Got it"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
