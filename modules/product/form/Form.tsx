// frontend: Form.tsx

"use client";

import Input from "@/shared/components/input";
import React, { useEffect, useState } from "react";
import ExistingProductReviewForm from "./components/ExistingProductReviewForm";
import NewProductCreationForm from "./components/NewProductCreationForm";
import { TProduct } from "@/lib/types";
import Button from "@/shared/components/button";
import { LucideSearch, Loader2 } from "lucide-react"; // Import Loader2 from lucide-react

const Form = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<TProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{
    product_name: string;
    imageUrl: string;
    _id: string;
  } | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [noResultsFoundAfterSearch, setNoResultsFoundAfterSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // <--- New state for loading indicator

  useEffect(() => {
    if (!searchQuery) {
      setProducts([]);
      setNoResultsFoundAfterSearch(false);
    }
  }, [searchQuery]);

  const fetchQuery = async () => {
    if (!searchQuery) {
      setProducts([]);
      setNoResultsFoundAfterSearch(false);
      return;
    }

    setIsSearching(true); // <--- Set loading to true when search starts
    setProducts([]);
    setNoResultsFoundAfterSearch(false);

    try {
      const res = await fetch(`/api/products/search?query=${searchQuery}`);
      const data = await res.json();

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        setNoResultsFoundAfterSearch(false);
      } else {
        setProducts([]);
        setNoResultsFoundAfterSearch(true);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Optionally, handle error message for the user
      setNoResultsFoundAfterSearch(true); // Show 'no results' or an error message on fetch failure
    } finally {
      setIsSearching(false); // <--- Set loading to false when search ends (success or failure)
    }

    setSelectedProduct(null);
    setShowNewProductForm(false);
  };

  const handleProductSelect = (product: TProduct) => {
    setSelectedProduct(product);
    setSearchQuery("");
    setNoResultsFoundAfterSearch(false);
  };

  const handleCreateNewProductClick = () => {
    setShowNewProductForm(true);
    setProducts([]);
    setNoResultsFoundAfterSearch(false);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-16 md:py-32">
      <div className="animate-fade-in space-y-4 relative">
        {!selectedProduct && !showNewProductForm && (
          <>
            <h2 className="text-xl font-semibold">Product Name</h2>
            <p className="text-gray-500">
              What is the name of the product you are reviewing?
            </p>
            <div className="flex items-center justify-center">
              <Input
                label="Product Name"
                name="productName"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., iPhone 15 Pro"
                disabled={isSearching} // <--- Disable input while searching
              />
              <Button
                type="button"
                onClick={fetchQuery}
                className="bg-amber-300"
                disabled={isSearching || !searchQuery} // <--- Disable button while searching or if query is empty
                icon={
                  isSearching ? (
                    <Loader2 className="animate-spin" size={14} /> // <--- Show spinner when loading
                  ) : (
                    <LucideSearch size={14} />
                  )
                }
                label={isSearching ? "Searching..." : ""} // <--- Optionally add "Searching..." text
              />
            </div>
          </>
        )}

        {products.length > 0 && !selectedProduct && (
          <div className="absolute top-46 left-1/2 w-full -translate-x-1/2 transform rounded-lg bg-[#eae5e5] p-4 shadow-sm dark:bg-black/10">
            {products.map((product, index) => (
              <button
                key={index}
                className="flex w-full items-center gap-2 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={() => handleProductSelect(product)}
              >
                <img
                  src={product?.imageUrl}
                  className="h-12 w-12 rounded-md object-cover"
                  alt="product image"
                />
                {product?.product_name}
              </button>
            ))}
          </div>
        )}

        {noResultsFoundAfterSearch && !showNewProductForm && !selectedProduct && (
          <div>
            <p>No products found for &quot;{searchQuery}&quot;.</p>
            <button
              onClick={handleCreateNewProductClick}
              className="text-blue-600 hover:underline"
            >
              Create a new product review for &quot;{searchQuery}&quot;
            </button>
          </div>
        )}

        {selectedProduct && (
          <ExistingProductReviewForm
            product={selectedProduct}
            setSearchQuery={setSearchQuery}
          />
        )}

        {showNewProductForm && (
          <NewProductCreationForm
            initialProductName={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default Form;