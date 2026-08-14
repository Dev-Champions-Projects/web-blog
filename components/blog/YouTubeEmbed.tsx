import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface YouTubeEmbedProps {
  url?: string | null;
  title?: string;
}

const YouTubeEmbed = ({ url, title = "YouTube video" }: YouTubeEmbedProps) => {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <section className="my-8">
      <div className="mb-3">
        <h3 className="text-xl font-semibold">Watch the Video</h3>
      </div>

      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
};

export default YouTubeEmbed;
