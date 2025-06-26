import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import { SendHorizonal } from "lucide-react";
import { redirect } from "next/navigation";
import BackButton from "@/components/product/component/back_button";
import StarRatingInput from "@/components/product/component/rating_input";

// Import the external server action for form submission
import { formSubmitHandler } from "@/components/product/actions/form_submit_handler";

interface ProductFormProps {
  searchParams: {
    step?: string;
    error?: string;
    success?: string;
  };
}

export default async function ProductForm({ searchParams }: ProductFormProps) {
  const step = parseInt(searchParams.step || "1", 10);
  const error = searchParams.error;

  const steps = [
    {
      label: "Product Name",
      field: "product_name",
      type: "text",
      placeholder: "What is the product you are reviewing?",
    },
    {
      label: "Description & Rating", // Combined step
      fields: ["description", "rating"], // Multiple fields for this step
      descriptionPlaceholder: "Describe the product you are reviewing...",
      descriptionMaxLength: 500, // Max length for description textarea
    },
    {
      label: "Product Image",
      field: "imageUrl",
      type: "text",
      placeholder: "Product Image URL",
    },
    {
      label: "Product Video (optional)", // New step for video
      field: "videoUrl",
      type: "text", // Assuming URL for now
      placeholder: "Product Video URL (YouTube, Vimeo, etc.)",
      optional: true, // Mark as optional
    },
    {
      label: "Product Price",
      field: "price",
      type: "text",
      placeholder: "Product Price (in USD)",
    },
    {
      label: "Company Name (optional)",
      field: "company_name",
      type: "text",
      placeholder: "Who sold this product?",
    },
  ];

  // Validate the step number from search parameters
  if (step < 1 || step > steps.length) {
    redirect("/products/add?error=Invalid+step"); // Redirect if step is out of bounds
  }

  // Get the configuration for the current step
  const currentStep = steps[step - 1];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-32">
      <form
        action={formSubmitHandler}
        className="w-full max-w-[500px] space-y-6"
      >
        <h1 className="w-full text-2xl tracking-tight font-medium mb-8">
          Review a Product - Step {step} of {steps.length}
        </h1>

        {/* Hidden input field to pass the current step number to the server action */}
        <input type="hidden" name="_step" value={step} />

        {/* Conditional rendering based on the current step's label */}
        {currentStep.label === "Description & Rating" ? (
          <>
            <Input
              label="Description"
              type="text"
              name="description"
              placeholder={currentStep.descriptionPlaceholder}
              required
              isTextArea={true}
              maxLength={currentStep.descriptionMaxLength}
            />
            <StarRatingInput label="Rating" name="rating" required={true} />
          </>
        ) : (
          <Input
            label={currentStep.label}
            type={currentStep.type}
            name={(currentStep as { field: string }).field}
            placeholder={currentStep.placeholder}
            required={!(currentStep as { optional?: boolean }).optional}
          />
        )}

        {/* Display error message if present in search parameters */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Form navigation buttons */}
        <div className="flex items-center space-x-4">
          {/* Back button, displayed if not on the first step */}
          {step > 1 && <BackButton currentStep={step} />}

          {/* Submit or Next button */}
          <Button
            label={step === steps.length ? "Submit" : "Next"}
            type="submit"
            icon={
              step === steps.length && (
                <SendHorizonal size={14} className="mr-2" />
              )
            }
            className="bg-blue-600 text-white"
          />
        </div>
      </form>
    </div>
  );
}
