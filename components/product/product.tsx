import Link from "next/link";
import React from "react";
import { type T_PRODUCT } from "./types/data";

const ProductCard = ({
  id,
  product_name,
  description,
  imageUrl,
  price,
  company_name,
}: T_PRODUCT) => {
  return (
    <Link href={`/products/${id}`}>
      <div className="w-full h-[400px] bg-black/5 dark:bg-white/5 rounded-lg p-1.5 flex flex-col">
        {/* Image */}
        <div className="w-full flex items-center justify-center h-56 rounded-md overflow-hidden bg-white">
          <img
            src={imageUrl}
            alt={product_name}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content Area */}
        <div className="w-full p-2 pb-4 relative">
          <div className="w-full flex items-center h-10 justify-between">
            <span className="py-8 opacity-70 text-sm tracking-tight">
              {company_name}
            </span>
            <span className="font-medium">${price}</span>
          </div>
          <h1 className="tracking-tight flex w-full items-center justify-between">
            <span>{product_name}</span>
          </h1>
          <p className="text-xs opacity-60">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
