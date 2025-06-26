"use client"; // Convert to a Client Component

import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import StarRatingInput from "@/components/product/component/rating_input";
import { SendHorizonal } from "lucide-react";
import { T_PRODUCT_DOCUMENT } from "@/components/product/types/data";

// Define the props interface for ProductForm
interface ProductFormProps {
  searchParams: { step?: string; error?: string; success?: string };
}

// Initial state for the form
const initialState: Omit<T_PRODUCT_DOCUMENT, "userId"> = {
  product_name: "",
  description: "",
  rating: 0,
  imageUrl: "",
  videoUrl: "",
  price: 0,
  company_name: "",
};

export default function ProductForm({ searchParams }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate and clean up the video preview URL
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      // Cleanup function to revoke the URL when videoFile changes or component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  // Handle input changes, including file inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setVideoFile(file || null);
    } else {
      const value = e.target.value;
      const processedValue =
        name === "price" || name === "rating"
          ? parseFloat(value) || 0
          : value;
      setFormData((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    }
  };

  // Handle rating changes from the star rating component
  const handleRatingChange = (rating: number) => {
    setFormData((prevData) => ({
      ...prevData,
      rating,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let uploadedVideoUrl = "";

      // Step 1: If a video file is selected, upload it first
      if (videoFile) {
        // Get a presigned URL from your backend
        const videoUploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileType: "video",
            contentType: videoFile.type,
          }),
        });

        const videoUploadData = await videoUploadResponse.json();

        if (!videoUploadResponse.ok) {
          throw new Error(
            videoUploadData.error || "Failed to get video upload URL."
          );
        }

        // Upload the actual file to the presigned S3 URL
        const s3UploadResponse = await fetch(videoUploadData.url, {
          method: "PUT",
          body: videoFile,
          headers: {
            "Content-Type": videoFile.type,
          },
        });

        if (!s3UploadResponse.ok) {
          throw new Error("Video upload to S3 failed.");
        }

        // The key is the unique identifier for the uploaded file
        uploadedVideoUrl = videoUploadData.key;
      }

      // Step 2: Prepare the final product data as a JSON object
      const productData = {
        ...formData,
        videoUrl: uploadedVideoUrl, // Use the key from the upload
      };

      // Step 3: Send the JSON data to your products API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData), // Send the data as a JSON string
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      router.push("/?success=Product+created+successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-32">
      <form onSubmit={handleSubmit} className="w-full max-w-[500px] space-y-6">
        <h1 className="w-full text-2xl tracking-tight font-medium mb-8">
          Review a Product
        </h1>

        <Input
          label="Product Name"
          type="text"
          name="product_name"
          placeholder="What is the product you are reviewing?"
          value={formData.product_name}
          onChange={handleChange}
          required
        />

        <Input
          label="Description"
          name="description"
          placeholder="Describe the product you are reviewing..."
          value={formData.description}
          onChange={handleChange}
          isTextArea={true}
          maxLength={500}
          required
        />

        <StarRatingInput
          label="Rating"
          name="rating"
          rating={formData.rating}
          onRatingChange={handleRatingChange}
          required
        />

        <Input
          label="Product Image URL"
          type="text"
          name="imageUrl"
          placeholder="https://example.com/image.png"
          value={formData.imageUrl}
          onChange={handleChange}
          required
        />

        <Input
          label="Product Video (Optional)"
          type="file"
          name="videoUrl"
          accept="video/*"
          onChange={handleChange}
        />

        {/* Video preview */}
        {videoPreviewUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Video Preview:</h3>
            <video src={videoPreviewUrl} controls className="w-full mt-2" />
          </div>
        )}

        <Input
          label="Product Price"
          type="number"
          name="price"
          placeholder="Product Price (in USD)"
          value={formData.price || ""}
          onChange={handleChange}
          required
        />

        <Input
          label="Company Name (Optional)"
          type="text"
          name="company_name"
          placeholder="Who sold this product?"
          value={formData.company_name || ""}
          onChange={handleChange}
        />

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex items-center space-x-4">
          <Button
            label={isLoading ? "Submitting..." : "Submit Review"}
            type="submit"
            icon={<SendHorizonal size={14} className="mr-2" />}
            className="bg-blue-600 text-white"
            // disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}