"use client"; // Required for using useState and onError handling

import Link from "next/link";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { PlayCircle } from "lucide-react";

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

  return (
    <Link href={`/products/${id}`}>
      <div className="w-[720px] h-auto dark:bg-white/5 rounded-lg p-2.5 flex flex-col border border-black/5">
        {/* Top section */}
        <div className="w-full flex items-start gap-2">
          {/* Thumbnail */}
          <div className="w-[120px] h-[100px] flex items-center justify-center overflow-hidden rounded-md">
            <img
              src={fallbackImage}
              alt={product_name}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setFallbackImage("/fallback.jpg")}
            />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col pl-1 space-y-1">
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
        <div className="w-full mt-1 flex items-start gap-3">
          {videoUrls.length > 0 ? (
            videoUrls.slice(0, 4).map((url, i) => (
              <Link key={i} href={`/products/${id}?videoIndex=${i}`}>
                <div className="relative rounded-md overflow-hidden h-56 w-42 bg-black/5 group">
                  <video
                    src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${url}`}
                    className="w-full h-full object-cover"
                    poster={fallbackImage}
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={48} className="text-white" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-md bg-black/5 h-56 w-42" />
              ))}
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
