"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  videoUrls: string[];
  initialIndex?: number;
  posterUrl?: string;
  distributionDomain?: string;
};

export default function ProductVideoFeed({
  videoUrls,
  initialIndex = 0,
  posterUrl,
  distributionDomain = process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME!,
}: Props) {
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => {
    setIdx(initialIndex);
  }, [initialIndex]);

  if (videoUrls.length === 0) {
    return <p className="p-4 text-gray-500">No videos available.</p>;
  }

  const prev = () => setIdx((i) => (i > 0 ? i - 1 : videoUrls.length - 1));
  const next = () => setIdx((i) => (i < videoUrls.length - 1 ? i + 1 : 0));

  const src = `${distributionDomain}/${videoUrls[idx]}`;

  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      <div className="relative h-screen bg-black/80">
        <video
          key={src}
          src={src}
          poster={posterUrl || "/fallback.jpg"}
          controls
          autoPlay
          preload="metadata"
          className="h-[480px] w-[280px] rounded-lg object-contain shadow"
          style={{ aspectRatio: "9/16" }}
        />
        {/* <div className="absolute bottom-4 right-4 text-white bg-black/50 px-2 py-1 rounded">
          {idx + 1} / {videoUrls.length}
        </div> */}
      </div>
      <div className="flex flex-col space-y-4">
        <button
          onClick={prev}
          className="rounded-full bg-black/10 p-2 hover:bg-black/20"
          aria-label="Previous"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={next}
          className="rounded-full bg-black/10 p-2 hover:bg-black/20"
          aria-label="Next"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}
