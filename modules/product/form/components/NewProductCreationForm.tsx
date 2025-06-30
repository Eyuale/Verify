"use client";

import Input from "@/shared/components/input";
import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/category";
import Button from "@/shared/components/button";
import { ArrowLeft, ArrowRight, Loader2, Pen } from "lucide-react";
// import { redirect } from "next/navigation"; // Remove this line
import { TProduct } from "@/lib/types"; // Import TProduct if not already imported

// Total number of steps in the form
const TOTAL_STEPS = 4;

const NewProductCreationForm = ({
  initialProductName,
  onProductCreated, // Add this new prop
}: {
  initialProductName: string;
  onProductCreated: (product: TProduct) => void; // Define its type
}) => {
  const [step, setStep] = useState(1);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_name: initialProductName,
    imageUrl: "",
    videoUrl: "",
    price: 0,
    company_name: "",
    category: "",
    model: "",
    webLink: "",
  });

  const handleClickNext = () => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const hanldeClickBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageError = () => {
    setImageLoadError(true);
    setImagePreviewUrl(null); // Clear the broken image if you prefer
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

        // If the changed input is the imageUrl, update the preview
    if (name === "imageUrl") {
      if (value) {
        setImagePreviewUrl(value);
        setImageLoadError(false); // Reset error on new URL
      } else {
        setImagePreviewUrl(null); // Clear preview if input is empty
        setImageLoadError(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const { newProduct }: { newProduct: TProduct} = await res.json(); // Get the created product data
      console.log(newProduct)
      onProductCreated(newProduct); // Call the callback with the new product
      // No redirect here
    } else {
      console.log(res);
      // Handle error, e.g., show an error message to the user
    }
    setIsSubmitting(false); // Ensure submission state is reset in finally or after success/error
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
        {step === 1 && (
          <div className="w-96">
            <Input
              label="Product Name"
              name="product_name"
              onChange={handleChange}
              value={formData.product_name}
              placeholder="e.g., New Gadget X"
            />
            <Input
              label="Model"
              name="model"
              placeholder="Model"
              onChange={handleChange}
              value={formData.model}
            />
            <Input
              label="Price"
              name="price"
              placeholder="price"
              onChange={handleChange}
              value={formData.price}
            />
          </div>
        )}
        {step === 2 && (
          <div className="w-96">
            <Input
              label="Image URL" // Changed label for clarity
              name="imageUrl"
              onChange={handleChange}
              value={formData.imageUrl}
              placeholder="Paste image address (e.g., https://example.com/image.jpg)"
            />
            {/* Image Preview Section */}
            {imagePreviewUrl && (
              <div className="mt-4 rounded-md border border-gray-300 p-2">
                <img
                  src={imagePreviewUrl}
                  alt="Image Preview"
                  className="h-auto max-w-full rounded-md object-contain"
                  onError={handleImageError} // Handle loading errors
                  style={{ maxHeight: "200px" }} // Limit preview height
                />
                {imageLoadError && (
                  <p className="mt-2 text-sm text-red-500">
                    Could not load image. Please check the URL.
                  </p>
                )}
              </div>
            )}
            <Input
              label="WebLinks"
              name="webLink"
              onChange={handleChange}
              value={formData.webLink}
              placeholder="e.g., https://example.com/product"
            />
          </div>
        )}
        {step === 3 && (
          <div className="w-96 space-y-4">
            <Input
              label="Company name"
              name="company_name"
              onChange={handleChange}
              value={formData.company_name}
              placeholder="e.g. Apple Inc, Samsung, ... "
            />
            <Select
              onValueChange={handleCategoryChange}
              value={formData.category}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => {
                  return (
                    <SelectItem key={index} value={category.category}>
                      {category.category}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex justify-between pt-4">
          <Button
            label="Back"
            type="button"
            onClick={hanldeClickBack}
            icon={<ArrowLeft size={16} />}
            className="bg-gray-200 text-black hover:bg-gray-300"
            disabled={step === 1 || isSubmitting}
          />

          {step < TOTAL_STEPS && (
            <Button
              label="Next"
              type="button"
              onClick={handleClickNext}
              icon={<ArrowRight size={16} />}
              className="bg-blue-600 text-white"
            />
          )}

          {step === TOTAL_STEPS && (
            <Button
              label={isSubmitting ? "Creating..." : "Create product"}
              type="submit"
              icon={
                isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Pen size={14} className="mr-2" />
                )
              }
              className="bg-blue-600 text-white"
              disabled={isSubmitting}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default NewProductCreationForm;