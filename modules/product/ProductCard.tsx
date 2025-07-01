"use client"; // Required for using useState and onError handling

import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type T_PRODUCT = {
  id: string;
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
  videoUrls?: string[];
  averageRating: number;
  reviewCount: number;
};

const ProductCard = ({
  id,
  product_name,
  description,
  imageUrl,
  // price,
  // company_name,
  videoUrls,
  averageRating,
  reviewCount,
}: T_PRODUCT) => {
  const [fallbackImage, setFallbackImage] = useState(imageUrl);

  // router
  const router = useRouter();

  return (
    <div
      className="p-30 flex h-auto w-full flex-col rounded-lg border border-black/5 p-2.5 dark:border-white/5"
      onClick={() => router.push(`/products/${id}`)}
    >
      {/* Top section */}
      <div className="flex w-full items-start gap-2">
        {/* Thumbnail */}
        <div className="flex h-[100px] w-[120px] items-center justify-center overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
          <img
            src={fallbackImage}
            alt={product_name}
            className="h-full w-full rounded-lg object-contain"
            onError={() => setFallbackImage("/fallback.jpg")}
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col space-y-1 pt-1 pl-1">
          <span className="text-xl font-normal tracking-tighter">
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
          <span className="max-w-[500px] text-sm opacity-80">
            {description}
          </span>
        </div>
      </div>

      <span className="mt-4 text-sm opacity-30">Video Reviews</span>
      <div className="mt-1 flex w-full items-start gap-4">
        {
        (videoUrls?.length ?? 0) > 0 ? (
          (videoUrls ?? []).slice(0, 4).map((url, i) => (
            <Link key={i} href={`/products/${id}?videoIndex=${i}`}>
              <div className="group relative h-64 w-42 overflow-hidden rounded-md bg-black/5">
                <video
                  src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${url}`}
                  className="h-full w-full object-cover"
                  preload="metadata"
                />
              </div>
            </Link>
          ))
        ) : (
          <>
            <div className="mt-4 flex w-full items-center justify-center">
              <span>No video reviews yet...</span>
              <h1>Be the first person to review this product</h1>
              <Link
                href={`/products/${id}/add-review`}
                className="rounded-full border-blue-500 px-4 py-5 text-blue-500"
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
