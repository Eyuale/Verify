"use client"; // <--- Convert to a Client Component

import { useState, FormEvent } from "react";
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

// Update the ProductForm component to accept searchParams as a prop
export default function ProductForm({ searchParams }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // You can now access searchParams here if needed, e.g., to display initial errors/success messages
  // For example:
  // useEffect(() => {
  //   if (searchParams.error) {
  //     setError(searchParams.error);
  //   }
  // }, [searchParams.error]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle number inputs for price and rating
    const processedValue =
      type === "number" || name === "price" || name === "rating"
        ? parseFloat(value) || 0
        : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };

  // Specific handler for the star rating component
  const handleRatingChange = (rating: number) => {
    setFormData((prevData) => ({
      ...prevData,
      rating,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      // On success, redirect to the homepage with a success message
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

        {/* Use the new handleRatingChange for the star component */}
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
          label="Product Video URL (Optional)"
          type="text"
          name="videoUrl"
          placeholder="https://youtube.com/watch?v=..."
          value={formData.videoUrl || ""}
          onChange={handleChange}
        />

        <Input
          label="Product Price"
          type="number" // Use type="number" for better semantics
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
          />
        </div>
      </form>
    </div>
  );
}
