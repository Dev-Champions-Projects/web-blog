const YOUTUBE_VIDEO_ID_REGEX =
    /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(
    value?: string | null,
): string | null {
    if (!value) {
        return null;
    }

    const input = value.trim();

    if (!input) {
        return null;
    }

    /*
     * Allow raw YouTube video IDs.
     */
    if (
        YOUTUBE_VIDEO_ID_REGEX.test(input)
    ) {
        return input;
    }

    try {
        const url = new URL(input);

        const hostname = url.hostname
            .replace(/^www\./, "")
            .toLowerCase();

        let videoId: string | null = null;

        /*
         * https://youtu.be/VIDEO_ID
         */
        if (hostname === "youtu.be") {
            videoId =
                url.pathname
                    .split("/")
                    .filter(Boolean)[0] ?? null;
        }

        /*
         * Normal YouTube URLs
         */
        if (
            hostname === "youtube.com" ||
            hostname === "m.youtube.com" ||
            hostname === "music.youtube.com"
        ) {
            /*
             * https://youtube.com/watch?v=VIDEO_ID
             */
            if (url.pathname === "/watch") {
                videoId =
                    url.searchParams.get("v");
            } else {
                const parts = url.pathname
                    .split("/")
                    .filter(Boolean);

                /*
                 * Shorts
                 * Embed
                 * Live
                 */
                if (
                    parts[0] === "shorts" ||
                    parts[0] === "embed" ||
                    parts[0] === "live"
                ) {
                    videoId =
                        parts[1] ?? null;
                }
            }
        }

        /*
         * Privacy-enhanced embed URLs
         */
        if (
            hostname ===
            "youtube-nocookie.com"
        ) {
            const parts = url.pathname
                .split("/")
                .filter(Boolean);

            if (parts[0] === "embed") {
                videoId =
                    parts[1] ?? null;
            }
        }

        if (
            !videoId ||
            !YOUTUBE_VIDEO_ID_REGEX.test(
                videoId,
            )
        ) {
            return null;
        }

        return videoId;
    } catch {
        return null;
    }
}

export function getYouTubeEmbedUrl(
    value?: string | null,
): string | null {
    const videoId =
        getYouTubeVideoId(value);

    if (!videoId) {
        return null;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}