"use server";

import { redirect } from "next/navigation";
import {
  handleStepAction,
  productFormAction,
} from "@/components/product/actions/product_form";

const steps = [
  {
    label: "Product Name",
    field: "product_name",
    type: "text",
    placeholder: "What is the product you are reviewing?",
  },
  {
    label: "Description & Rating",
    fields: ["description", "rating"],
    descriptionPlaceholder: "Describe the product you are reviewing...",
    descriptionMaxLength: 500,
  },
  {
    label: "Product Image",
    field: "imageUrl",
    type: "text",
    placeholder: "Product Image URL",
  },
  {
    label: "Product Video (optional)",
    field: "videoUrl",
    type: "text",
    placeholder: "Product Video URL (YouTube, Vimeo, etc.)",
    optional: true,
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

// This is your new standalone Server Action
export async function formSubmitHandler(formData: FormData) {
  // <--- Only formData as argument now
  const stepString = formData.get("_step"); // <--- Get _step from formData
  const currentStepNumber = parseInt(stepString as string, 10);

  // Validate currentStepNumber, just in case
  if (
    isNaN(currentStepNumber) ||
    currentStepNumber < 1 ||
    currentStepNumber > steps.length
  ) {
    redirect("/products/add?error=Invalid+step+data");
    return; // Exit to prevent further execution
  }

  const currentStep = steps[currentStepNumber - 1];

  if (currentStepNumber < steps.length) {
    const stepFormData = new FormData();

    if ("fields" in currentStep && Array.isArray(currentStep.fields)) {
      currentStep.fields.forEach((fieldName) => {
        const fieldValue = formData.get(fieldName);
        if (fieldValue !== null) {
          stepFormData.append(fieldName, fieldValue);
        }
      });
    } else if (
      "field" in currentStep &&
      typeof currentStep.field === "string"
    ) {
      const fieldValue = formData.get(currentStep.field);
      if (fieldValue !== null) {
        stepFormData.append(currentStep.field, fieldValue);
      }
    } else {
      console.warn(
        "Unexpected step configuration for handleStepAction:",
        currentStep
      );
    }

    await handleStepAction(stepFormData, currentStepNumber);
    redirect(`/products/add?step=${currentStepNumber + 1}`);
  } else {
    const result = await productFormAction(formData);
    console.log("Form submission result:", result);

    if (result.success) {
      redirect("/?success=Product+created+successfully");
    } else {
      redirect(
        `/products/add?step=${currentStepNumber}&error=${encodeURIComponent(
          result.error || "Unknown error"
        )}`
      );
    }
  }
}
