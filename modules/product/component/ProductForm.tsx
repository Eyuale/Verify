"use client";

import {
  useState,
  FormEvent,
  useEffect,
  ChangeEvent,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // <-- Import Clerk's useUser hook
import { debounce } from "lodash"; // <-- We'll use debounce for the search

// Component Imports
import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import StarRatingInput from "@/modules/product/component/rating_input";
import { SendHorizontal, Search, Loader2, Info } from "lucide-react";

// Type Imports
import { T_PRODUCT_DOCUMENT } from "@/modules/product/types/data";

// Define the shape of the form data
interface FormData {
  product_name: string;
  description: string; // This will be the review description
  rating: number;
  imageUrl: string;
  price: number;
  company_name: string;
  model: string; // <-- Added model
  category: string; // <-- Added category
}

// Define the shape of a product returned by our search API
type T_SEARCH_PRODUCT = Pick<
  T_PRODUCT_DOCUMENT,
  | "_id"
  | "product_name"
  | "description"
  | "imageUrl"
  | "price"
  | "company_name"
  | "model"
  | "category"
>;

export default function ProductForm() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser(); // <-- Get user from Clerk

  // State Management
  const [step, setStep] = useState(1); // 1: Search for Product, 2: Fill Details
  const [formData, setFormData] = useState<FormData>({
    product_name: "",
    description: "",
    rating: 0,
    imageUrl: "",
    price: 0,
    company_name: "",
    model: "", // <-- Initialize model
    category: "", // <-- Initialize category
  });
  const [selectedProduct, setSelectedProduct] =
    useState<T_SEARCH_PRODUCT | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Search-related state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<T_SEARCH_PRODUCT[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Video and submission state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function handleSearch
   * @description Fetches product search results from the API.
   * This function is debounced to prevent API calls on every keystroke.
   */
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setSearchResults(data.products || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300), // 300ms debounce delay
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  /**
   * @function handleSelectProduct
   * @description Sets the selected product and moves to the next step.
   * @param {T_SEARCH_PRODUCT} product - The product selected from the search results.
   */
  const handleSelectProduct = (product: T_SEARCH_PRODUCT) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      product_name: product.product_name,
      company_name: product.company_name || "",
      model: product.model || "",
      category: product.category || "",
    }));
    setIsNewProduct(false);
    setSearchResults([]);
    setSearchQuery(product.product_name);
    setStep(2);
  };

  /**
   * @function handleCreateNewProduct
   * @description Sets the state to create a new product and moves to the next step.
   */
  const handleCreateNewProduct = () => {
    if (!searchQuery) {
      setError("Please enter a product name to create a new product.");
      return;
    }
    setIsNewProduct(true);
    setSelectedProduct(null);
    setFormData((prev) => ({ ...prev, product_name: searchQuery }));
    setSearchResults([]);
    setStep(2);
  };

  /**
   * @function handleChange
   * @description Updates form data state on input changes.
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setVideoFile(file || null);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  /**
   * @function handleRatingChange
   * @description Updates rating state.
   */
  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  /**
   * @function handleSubmit
   * @description Handles the final form submission.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isUserLoaded || !user) {
      setError("You must be logged in to submit a review.");
      return;
    }
    if (formData.rating === 0) {
      setError("Please provide a rating.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      let uploadedVideoUrl = "";
      // Step 1: Upload video to S3 if it exists
      if (videoFile) {
        // 1a: Get a pre-signed URL from our API
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: "video",
            contentType: videoFile.type,
          }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadData.error || "Failed to get upload URL");

        // 1b: Upload the file directly to S3
        const s3Res = await fetch(uploadData.url, {
          method: "PUT",
          body: videoFile,
          headers: { "Content-Type": videoFile.type },
        });
        if (!s3Res.ok) throw new Error("Video upload to S3 failed");
        uploadedVideoUrl = uploadData.key;
      }

      // Step 2: Prepare the final payload for our backend
      const payload = {
        isNew: isNewProduct,
        productId: selectedProduct?._id, // Send ID if product exists
        productData: {
          product_name: formData.product_name,
          description: isNewProduct
            ? formData.description
            : selectedProduct!.description,
          imageUrl: isNewProduct
            ? formData.imageUrl
            : selectedProduct!.imageUrl,
          price: isNewProduct ? formData.price : selectedProduct!.price,
          company_name: isNewProduct
            ? formData.company_name
            : selectedProduct!.company_name,
          model: formData.model, // <-- Add model
          category: formData.category, // <-- Add category
        },
        reviewData: {
          userId: user.id, // <-- Using Clerk User ID
          rating: formData.rating,
          description: formData.description, // The review text
          videoUrl: uploadedVideoUrl,
        },
      };

      // Step 3: Post the data to our main products API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      // Redirect on success
      router.push(`/?success=Review+submitted+successfully!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a local preview URL for the selected video
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setVideoPreviewUrl(null);
  }, [videoFile]);

  // Main Render Logic
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-16 md:py-32">
      <form onSubmit={handleSubmit} className="w-full max-w-[600px] space-y-6">
        <h1 className="text-2xl font-medium mb-8 text-center">
          {step === 1
            ? "Find a Product to Review"
            : `Reviewing: ${formData.product_name}`}
        </h1>

        {/* STEP 1: PRODUCT SEARCH */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Product Name"
                type="text"
                name="product_name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Start typing a product name..."
                required
              />
              <div className="absolute top-9 right-3">
                {isSearching ? (
                  <Loader2 className="animate-spin text-gray-400" size={20} />
                ) : (
                  <Search className="text-gray-400" size={20} />
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product._id.toString()}
                    onClick={() => handleSelectProduct(product)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <p className="font-semibold">{product.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {product.company_name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center pt-4">
              <p className="opacity-60 text-sm mb-2">Can't find the product?</p>
              <Button
                type="button"
                label="Create a New Product Profile"
                onClick={handleCreateNewProduct}
                className="bg-gray-200 text-black hover:bg-gray-300"
              />
            </div>
          </div>
        )}

        {/* STEP 2: FILL IN REVIEW AND/OR PRODUCT DETAILS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {isNewProduct ? (
              // Form for a NEW product
              <>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                  <Info size={16} className="text-blue-600" />
                  <p className="text-sm text-blue-700">
                    You're creating a new product profile. Please fill in all
                    details.
                  </p>
                </div>
                <Input
                  label="Product Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  isTextArea
                  maxLength={500}
                  placeholder="Describe the product itself..."
                  required
                />
                <Input
                  label="Product Image URL"
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
                <Input
                  label="Price (USD)"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 19.99"
                  required
                />
                <Input
                  label="Company Name"
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g., Apple"
                />
                <Input
                  label="Model"
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., iPhone 15 Pro"
                />
                <Input
                  label="Category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Electronics"
                />
                <hr className="my-6" />
                <h2 className="text-lg font-semibold">Your Review</h2>
                <StarRatingInput
                  label="Your Rating"
                  name="rating"
                  rating={formData.rating}
                  onRatingChange={handleRatingChange}
                  required
                />
                <Input
                  label="Your Review Comment"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  isTextArea
                  maxLength={500}
                  placeholder="Share your experience with the product..."
                  required
                />
              </>
            ) : (
              // Form for an EXISTING product
              <>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-semibold">
                    {selectedProduct?.product_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedProduct?.description}
                  </p>
                </div>
                <h2 className="text-lg font-semibold">Submit Your Review</h2>
                <StarRatingInput
                  label="Your Rating"
                  name="rating"
                  rating={formData.rating}
                  onRatingChange={handleRatingChange}
                  required
                />
                <Input
                  label="Your Review Comment"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  isTextArea
                  maxLength={500}
                  placeholder="Share your experience..."
                  required
                />
              </>
            )}

            {/* Common Fields for both New and Existing */}
            <Input
              label="Upload Review Video (Optional)"
              type="file"
              name="videoUrl"
              accept="video/*"
              onChange={handleChange}
            />
            {videoPreviewUrl && (
              <div>
                <h3 className="text-md font-medium text-gray-700">
                  Video Preview
                </h3>
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full mt-2 rounded-md"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="flex gap-4 pt-4">
              <Button
                label="Back"
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSearchResults([]);
                }}
                className="bg-gray-200 text-black hover:bg-gray-300"
              />
              <Button
                label={isSubmitting ? "Submitting..." : "Submit Review"}
                type="submit"
                icon={
                  isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <SendHorizontal size={14} />
                  )
                }
                className="bg-blue-600 text-white flex-grow"
                disabled={isSubmitting || !isUserLoaded}
              />
            </div>
            {!isUserLoaded && (
              <p className="text-sm text-center text-gray-500">
                Loading user session...
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
