"use client";

type ScrollableVideoListProps = {
  videoUrls: string[];
  posterUrl?: string;
  distributionDomain?: string;
};

export default function ScrollableVideoList({
  videoUrls,
  posterUrl,
  distributionDomain = process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME!,
}: ScrollableVideoListProps) {
  if (videoUrls.length === 0) {
    return (
      <p className="p-4 text-center text-gray-500">No videos to display.</p>
    );
  }

  return (
    <div className="h-full space-y-4 overflow-y-auto p-2">
      {videoUrls.map((url, idx) => (
        <video
          key={idx}
          src={`${distributionDomain}/${url}`}
          poster={posterUrl}
          controls
          preload="metadata"
          className="w-full rounded-lg shadow-sm"
        />
      ))}
    </div>
  );
}
