"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search_query");
  const [products, setProducts] = useState<
    { product_name: string; imageUrl: string; _id: string }[]
  >([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`/api/products/search?query=${searchQuery}`);
      const data = await res.json();
      setProducts(data.products || []);
    };

    fetchProducts();
  }, [searchQuery]);

  return (
    <div className="pt-32">
      <h1>Search Result: {searchQuery}</h1>
      <div className="">
        {products.map((product, index) => {
          console.log(products);
          return (
            <Link
              href={`/products/${product._id}`}
              key={index}
              className="flex w-full items-center gap-2 py-2"
            >
              <img
                src={product?.imageUrl}
                className="h-12 w-12 rounded-md object-cover"
                alt="product image"
              />
              {product?.product_name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
