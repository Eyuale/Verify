// navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Button from "@/shared/components/button";
import ToggleTheme from "@/theme/component/ToggleTheme";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, PenLineIcon } from "lucide-react";
import Link from "next/link";
import Input from "@/shared/components/input";
import { useRouter } from "next/navigation";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<
    { product_name: string; imageUrl: string; _id: string }[]
  >([]);
  const [isMounted, setIsMounted] = useState(false); // New state for client-side mount
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Set to true once component mounts on client

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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    console.log(e.key);
    if (e.key === "Enter" && searchQuery) {
      handleLinkClick(); // Clear suggestions before navigating
      router.push(`/result?search_query=${searchQuery}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between bg-white px-4 dark:bg-[#151314]">
      <div className="flex items-center gap-2">
        <div
          onClick={toggleSidebar}
          className="cursor-pointer rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Menu size={16} />
        </div>
        <h3 className="flex items-center gap-0.5 font-medium tracking-tight">
          <Link href={"/"}>Verify</Link>
        </h3>
      </div>
      <div>
        <Input
          placeholder="Search products..."
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
      <div className="flex h-full items-center gap-4">
        <Link href="/products/add">
          <Button
            type="button"
            label="Write"
            icon={<PenLineIcon size={14} strokeWidth={3} />}
            className="gap-1 bg-blue-50 pr-5 text-blue-800/90 dark:bg-blue-50/10 dark:text-[#a8c8fb]"
          />
        </Link>
        {isMounted && ( // Conditionally render Clerk components after mount
          <>
            <SignedOut>
              <Link href="/sign-in">
                <Button
                  type="button"
                  label="Log In"
                  className="bg-black/85 text-white/90 dark:bg-white/5"
                />
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </>
        )}
        <ToggleTheme />
      </div>
    </nav>
  );
}
