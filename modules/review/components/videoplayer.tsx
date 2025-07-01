// app/components/VideoPlayer.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons"; // Filled heart icon
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"; // Outline heart icon

type VideoPlayerProps = {
  src: string;
  reviewId: string; // The ID of the review this video belongs to
  currentUserId: string | null; // The ID of the currently logged-in user
};

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseOver = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseOut = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        className="h-80 w-full rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
        preload="metadata"
        muted
        loop
        playsInline
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />
    </div>
  );
}
