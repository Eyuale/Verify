// app/components/VideoPlayer.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons"; // Filled heart icon
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"; // Outline heart icon

type VideoPlayerProps = {
  src: string;
  initialLikes: number;
  reviewId: string; // The ID of the review this video belongs to
  currentUserId: string | null; // The ID of the currently logged-in user
  isLikedInitially: boolean; // Indicates if the current user liked it when loaded
};

// Helper function to format large numbers (e.g., 1000 -> 1k, 102500 -> 102.5k)
const formatLikeCount = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

export default function VideoPlayer({
  src,
  initialLikes,
  reviewId,
  currentUserId,
  isLikedInitially,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [likes, setLikes] = useState(initialLikes); // State for the current like count
  const [isLiked, setIsLiked] = useState<boolean>(isLikedInitially); // State to track if the current user has liked it

  // Update likes and isLiked state if initial props change (e.g., if data refetches)
  useEffect(() => {
    setLikes(initialLikes);
    setIsLiked(isLikedInitially);
  }, [initialLikes, isLikedInitially]);

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

  const handleLikeClick = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default link navigation
    event.stopPropagation(); // Stop event bubbling up to parent elements

    if (!currentUserId) {
      // If no user is logged in, prompt them to log in
      alert("Please log in to like this video.");
      return;
    }

    // Optimistic UI update: update state immediately, then send API request
    const prevLikes = likes;
    const prevIsLiked = isLiked;

    setLikes(isLiked ? prevLikes - 1 : prevLikes + 1);
    setIsLiked(!isLiked);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        // Ensure this URL matches your backend route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // No need to send userId in body; Clerk's getAuth handles it on the server
      });

      if (!res.ok) {
        // If API call fails, revert UI changes and show an error
        setLikes(prevLikes);
        setIsLiked(prevIsLiked);
        throw new Error("Failed to update like status.");
      }

      const data = await res.json();
      // Ensure local state matches database state after successful API call
      setLikes(data.newLikeCount);
      setIsLiked(data.hasLiked);
    } catch (error) {
      console.error("Error updating like:", error);
      alert("Could not update like. Please try again.");
      // Revert UI changes if API call failed
      setLikes(prevLikes);
      setIsLiked(prevIsLiked);
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

      {/* Like Button Overlay */}
      <div className="absolute right-2 bottom-2 flex items-center space-x-1 rounded-full bg-black/50 px-3 py-1 text-white">
        <button
          onClick={handleLikeClick}
          className="flex items-center space-x-1 focus:outline-none" // Add focus-outline-none for better UX
        >
          <FontAwesomeIcon
            icon={isLiked ? faHeartSolid : faHeartRegular} // Choose solid or outline icon based on like status
            className={isLiked ? "text-red-500" : "text-gray-300"} // Change color based on like status
          />
          <span className="text-sm">{formatLikeCount(likes)}</span>
        </button>
      </div>
    </div>
  );
}
