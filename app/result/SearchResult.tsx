// app/result/SearchResults.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search_query');
  const [products, setProducts] = useState<
    { product_name: string; imageUrl: string; _id: string }[]
  >([]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch(`/api/products/search?query=${searchQuery}`);
      const data = await res.json();
      setProducts(data.products || []);
    }
    fetchProducts();
  }, [searchQuery]);

  return (
    <div>
      <h1>Search Result: {searchQuery}</h1>
      <div className="space-y-2">
        {products.map((product) => (
          <Link
            href={`/products/${product._id}`}
            key={product._id}
            className="flex items-center gap-2 py-2"
          >
            <img
              src={product.imageUrl}
              alt={product.product_name}
              className="h-12 w-12 rounded-md object-cover"
            />
            {product.product_name}
          </Link>
        ))}
      </div>
    </div>
  );
}
