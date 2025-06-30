import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const SearchArea = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<{ product_name: string, imageUrl: string, _id: string }[]>([]);
    const router = useRouter()
  useEffect(() => {

    const fetchProducts = async () => {
      const res = await fetch(`/api/products/search?query=${searchQuery}`);
      const data = await res.json();
      setProducts(data.products || []);
    };

    if (searchQuery) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [searchQuery]);

  // Function to handle clearing search query and products when a link is clicked
  const handleLinkClick = () => {
    setSearchQuery(""); // Clear the search query
    setProducts([]); // Clear the products
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e.key);
    if (e.key === "Enter" && searchQuery) {
      handleLinkClick(); // Clear suggestions before navigating
      router.push(`/result?search_query=${searchQuery}`);
    }
  };
  return (
    <div className="h-8 w-72 rounded-full border border-black/10">
      <Input
        placeholder="search product"
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
        onKeyDown={handleKeyDown} // Add onKeyDown event listener
      />
      {searchQuery && products && products.length > 0 ? (
        <div className="absolute top-16 left-1/2 w-[50%] -translate-x-1/2 transform rounded-lg bg-[#eae5e5] p-4 shadow-sm dark:bg-black/10">
          {products.map((product, index) => {
            console.log(products);
            return (
              <Link
                href={`/products/${product._id}`}
                key={index}
                className="flex w-full items-center gap-2 py-2"
                onClick={handleLinkClick} // Call handleLinkClick when a product link is clicked
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
      ) : searchQuery && products.length === 0 ? (
        <div>No products found.</div>
      ) : null}
    </div>
  );
};

export default SearchArea;
