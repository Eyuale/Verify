import Link from "next/link";
import React from "react";
import { type T_PRODUCT } from "./types/data";

// icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { LucideStar } from "lucide-react";

const ProductCard = ({
  id,
  product_name,
  description,
  imageUrl,
  price,
  company_name,
}: T_PRODUCT) => {
  return (
    // Product Card Component //
    <Link href={`/products/${id}`}>
      <div className="w-[720px] h-auto dark:bg-white/5 rounded-lg p-2.5 flex flex-col border border-black/5">
        <div className="w-full flex items-start gap-2">
          <div className="w-[120px] h-[100px] flex items-center justify-center overflow-hidden rounded-md">
            <img
              src={imageUrl}
              alt={product_name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          {/*  */}
          <div className="flex flex-1 flex-col pl-1 space-y-1">
            <span className="font-normal tracking-tighter text-xl ">
              {product_name}
            </span>
            <span className="flex items-center gap-1 text-sm">
              <span className="opacity-70 text-sm">4.6</span>
              <FontAwesomeIcon
                icon={faStar}
                size="xs"
                className="text-yellow-500"
              />
              <span className="opacity-70 text-sm">1.2K reviews</span>
            </span>
            <span className="text-sm max-w-[500px] opacity-80">
              {description}
            </span>
          </div>
        </div>
        <span className="text-sm opacity-30 mt-4">Video Reviews</span>
        <div className="w-full mt-1 flex items-start gap-3">
          <div className="rounded-md bg-black/5 h-56 w-42" />
          <div className="rounded-md bg-black/5 h-56 w-42" />
          <div className="rounded-md bg-black/5 h-56 w-42" />
          <div className="rounded-md bg-black/5 h-56 w-42" />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
