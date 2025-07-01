// app/components/ReviewCard.tsx
"use client";

import Link from "next/link";
import VideoPlayer from "./components/videoplayer"; // Ensure this path is correct relative to ReviewCard.tsx
import { TProduct, TReviews, TUser } from "@/lib/types";
import { useAuth } from "@clerk/nextjs"; // Import useAuth to get the current user ID

type ReviewCardProps = {
  review: TReviews;
  product: TProduct;
  user: TUser | undefined;
};

// Helper function to format time ago (e.g., "10 hours ago")
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
};

export default function ReviewCard({ review, user }: ReviewCardProps) {
  const reviewId = (review as any)._id; // Assuming _id exists on the review object
  const { userId: currentUserId } = useAuth(); // Get the current authenticated user's ID from Clerk

  // Determine if the current user has already liked this review
  // The 'likedBy' array comes from the 'review' prop (fetched in page.tsx)
  const isLikedInitially =
    review.likedBy?.includes(currentUserId || "") || false;

  return (
    <Link
      href={`/products/${review.productId}/reviews/${reviewId}`}
      key={reviewId}
      className="block w-56 overflow-hidden rounded-sm"
    >
      <div className="relative">
        {/* Video Player component */}
        <VideoPlayer
          src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${review.videoUrl}`}
          reviewId={reviewId}
          currentUserId={currentUserId ?? null}
        />

        {/* New Text Info Block - Below the video thumbnail */}
        <div className="w-full p-2">
          {/* Reviewer's Description (Truncated) */}
          {review.reviewDescription && (
            // Apply the custom truncation class here
            <p className="review-description-truncate mb-1 text-sm">
              {review.reviewDescription}
            </p>
          )}

          {/* User Info, Posted Time, and Rating */}
          <div className="flex flex-col text-sm">
            <div className="flex text-xs opacity-60">
              <span>{formatTimeAgo(review.createdAt)}</span>
              <span className="mx-1">•</span>
            </div>
            {/* User Info (Avatar + Name) */}
            <div className="flex items-center gap-1.5">
              {user ? (
                <>
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || "User Avatar"}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                  {user.firstName && (
                    <span className="text-sm text-black/70">
                      {user.firstName}
                    </span>
                  )}
                </>
              ) : (
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-500"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
