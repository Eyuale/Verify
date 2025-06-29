"use client"; // Required for using useState and onError handling

import Link from "next/link";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type T_PRODUCT = {
  id: string;
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
  videoUrls: string[];
  averageRating: number;
  reviewCount: number;
};

const ProductCard = ({
  id,
  product_name,
  description,
  imageUrl,
  price,
  company_name,
  videoUrls,
  averageRating,
  reviewCount,
}: T_PRODUCT) => {
  const [fallbackImage, setFallbackImage] = useState(imageUrl);

  // router
  const router = useRouter();

  return (
    <div
      className="w-full h-auto rounded-lg p-2.5 flex flex-col border border-black/5 dark:border-white/5"
      onClick={() => router.push(`/products/${id}`)}
    >
      {/* Top section */}
      <div className="w-full flex items-start gap-2">
        {/* Thumbnail */}
        <div className="w-[120px] h-[100px] flex items-center justify-center overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
          <img
            src={fallbackImage}
            alt={product_name}
            className="w-full h-full object-contain rounded-lg"
            onError={() => setFallbackImage("/fallback.jpg")}
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col pl-1 space-y-1 pt-1">
          <span className="font-normal tracking-tighter text-xl">
            {product_name}
          </span>

          {/* Rating */}
          <span className="flex items-center gap-1 text-sm">
            <span className="opacity-70">{averageRating.toFixed(1)}</span>
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                size="xs"
                className={
                  i < Math.round(averageRating)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="opacity-70">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </span>

          {/* Description */}
          <span className="text-sm max-w-[500px] opacity-80">
            {description}
          </span>
        </div>
      </div>

      {/* Video section */}
      <span className="text-sm opacity-30 mt-4">Video Reviews</span>
      <div className="w-full mt-1 flex items-start gap-4">
        {videoUrls.length > 0 ? (
          videoUrls.slice(0, 4).map((url, i) => (
            <Link key={i} href={`/products/${id}?videoIndex=${i}`}>
              <div className="relative rounded-md overflow-hidden h-64 w-42 bg-black/5 group">
                <video
                  src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${url}`}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              </div>
            </Link>
          ))
        ) : (
          <>
            <div className="w-full mt-4 flex items-center justify-center">
              <span>No video reviews yet...</span>
              <h1>Be the first person to review this product</h1>
              <Link
                href={`/products/${id}/add-review`}
                className="py-5 px-4 border-blue-500 rounded-full text-blue-500"
              >
                Add a Review
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
