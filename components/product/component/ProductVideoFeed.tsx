"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  videoUrls: string[];
  posterUrl?: string;
  distributionDomain?: string;
};

export default function ProductVideoFeed({
  videoUrls,
  posterUrl,
  distributionDomain = process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME!,
}: Props) {
  const [idx, setIdx] = useState(0);

  if (videoUrls.length === 0) {
    return <p className="text-gray-500">No videos available.</p>;
  }

  const prev = () => setIdx((i) => (i > 0 ? i - 1 : videoUrls.length - 1));
  const next = () => setIdx((i) => (i < videoUrls.length - 1 ? i + 1 : 0));

  const src = `${distributionDomain}/${videoUrls[idx]}`;

  useEffect(() => {
    console.log("Current video src:", src);
  }, [src]);

  return (
    <div className="flex flex-col items-center space-y-3 p-4">
      <button
        onClick={prev}
        className="p-2 rounded bg-black/10 hover:bg-black/20"
        aria-label="Previous"
      >
        <ChevronUp size={24} />
      </button>

      <video
        key={src}
        src={src}
        poster={posterUrl || "/fallback.jpg"}
        controls
        preload="metadata"
        className="w-[280px] h-[480px] object-cover rounded-lg shadow"
      />

      <button
        onClick={next}
        className="p-2 rounded bg-black/10 hover:bg-black/20"
        aria-label="Next"
      >
        <ChevronDown size={24} />
      </button>

      <p className="text-sm text-gray-600">
        {idx + 1} / {videoUrls.length}
      </p>
    </div>
  );
}
