"use client";

import { useState, FormEvent, ChangeEvent } from "react";

// Component Imports
import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import StarRatingInput from "@/modules/product/component/rating_input";
import { ArrowRight, ArrowLeft, SendHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/category";
import { useRouter } from "next/navigation";

// Total number of steps in the form
const TOTAL_STEPS = 4;

export default function ProductForm() {
  // State Management
  const router = useRouter()
  const [products, setProducts] = useState<
    { product_name: string; imageUrl: string; _id: string }[]
  >([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: "",
    reviewDescription: "",
    imageUrl: "",
    videoUrl: "",
    rating: 0,
    price: 0,
    company_name: "",
    category: "",
    model: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @function handleNext
   * @description Moves to the next step of the form.
   */
  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  /**
   * @function handleBack
   * @description Moves to the previous step of the form.
   */
  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  /**
   * @function handleChange
   * @description A generic handler for form inputs.
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const fetchProducts = async () => {
      const res = await fetch(`/api/products/search?query=${value}`);
      const data = await res.json();
      setProducts(data.products || []);
    };

    if (value) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  };

  /**
   * @function handleRatingChange
   * @description A specific handler for the star rating component.
   */
  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  /**
   * @function handleSubmit
   * @description Placeholder for form submission logic.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log(formData)

    // const res = await fetch('/api/products',{
    //   method: "POST",
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData)
    // })
    
    // if(res.ok){
    //   setIsSubmitting(false)
    //   router.push('/')
    // } else {
    //    const errorData = await res.json(); // Parse error response
    //     console.error('Form submission failed:', errorData);
    // }

  };

  // Main Render Logic
  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-16 md:py-32">
      <form onSubmit={handleSubmit} className="w-full max-w-[600px] space-y-8">
        <h1 className="text-center text-2xl font-medium">
          Step {step} of {TOTAL_STEPS}
        </h1>

        {/* Render the current step's content */}
        <div className="min-h-[150px]">
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-semibold">Product Name</h2>
              <p className="text-gray-500">
                What is the name of the product you are reviewing?
              </p>
              <Input
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="e.g., iPhone 15 Pro"
              />
              {formData.productName && products && products.length > 0 ? (
                <div className="absolute top-16 left-1/2 w-[50%] -translate-x-1/2 transform rounded-lg bg-[#eae5e5] p-4 shadow-sm dark:bg-black/10">
                  {products.map((product, index) => {
                    console.log(products);
                    return (
                      <Link
                        href={`/review-product`}
                        key={index}
                        className="flex w-full items-center gap-2 py-2"
                        // onClick={handleLinkClick} // Call handleLinkClick when a product link is clicked
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
              ) : formData.productName && products.length === 0 ? (
                <div>No products found.</div>
              ) : null}
              <div className="w-full">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => {
                      return (
                        <SelectItem key={index} value={category.category}>{category.category}</SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-semibold">Your Review</h2>
              <p className="text-gray-500">
                Please share your experience with the product.
              </p>
              <Input
                label="Review Comment"
                name="reviewDescription"
                value={formData.reviewDescription}
                onChange={handleChange}
                isTextArea
                placeholder="It was amazing..."
              />
              <p className="text-gray-500">
                How would you rate this product out of 5?
              </p>
              <StarRatingInput
                name="Rate the product"
                rating={formData.rating}
                onRatingChange={handleRatingChange}
              />
            </div>
          )}
          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-semibold">Product price</h2>
              <Input placeholder="price" type="number" />
              <Input placeholder="company name" />
            </div>
          )}
          {step === 4 && (
            <div className="animate-fade-in space-y-4">
              <p>You can upload a image if you have one.</p>
              <Input
                label="Product image"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
              />
              <h2 className="text-xl font-semibold">Upload Video (Optional)</h2>
              <p className="text-gray-500">
                You can upload a video review if you have one.
              </p>
              <Input
                label="Review Video"
                name="video"
                type="file"
                accept="video/*"
                onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    video: (e.target as HTMLInputElement).files ? (e.target as HTMLInputElement).files![0] : null,
                  }))
                }
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            label="Back"
            type="button"
            onClick={handleBack}
            icon={<ArrowLeft size={16} />}
            className="bg-gray-200 text-black hover:bg-gray-300"
            disabled={step === 1 || isSubmitting}
          />

          {step < TOTAL_STEPS && (
            <Button
              label="Next"
              type="button"
              onClick={handleNext}
              icon={<ArrowRight size={16} />}
              className="bg-blue-600 text-white"
            />
          )}

          {step === TOTAL_STEPS && (
            <Button
              label={isSubmitting ? "Submitting..." : "Submit"}
              type="submit"
              icon={
                isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <SendHorizontal size={14} />
                )
              }
              className="bg-green-600 text-white"
              disabled={isSubmitting}
            />
          )}
        </div>
      </form>
    </div>
  );
}
