import {
  productFormAction,
  ActionResponse,
  handleStepAction,
} from "@/components/product/actions/product_form";
import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import { SendHorizonal } from "lucide-react";
import { redirect } from "next/navigation";
import BackButton from "@/components/product/component/back_button";

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
      label: "Description",
      field: "description",
      type: "text",
      placeholder: "Describe the product you are reviewing...",
    },
    {
      label: "Product Image",
      field: "imageUrl",
      type: "text",
      placeholder: "Product Image URL",
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

  if (step < 1 || step > steps.length) {
    redirect("/products/add?error=Invalid+step");
  }

  const currentStep = steps[step - 1];

  const handleSubmit = async (formData: FormData) => {
    "use server";
    if (step < steps.length) {
      await handleStepAction(formData, step);
      redirect(`/products/add?step=${step + 1}`);
    } else {
      const result = await productFormAction(formData);
      console.log("Form submission result:", result);
      if (result.success) {
        redirect("/?success=Product+created+successfully");
      } else {
        redirect(
          `/products/add?step=${step}&error=${encodeURIComponent(
            result.error || "Unknown error"
          )}`
        );
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-32">
      <form action={handleSubmit} className="w-full max-w-[500px] space-y-6">
        <h1 className="w-full text-2xl tracking-tight font-medium mb-8">
          Review a Product - Step {step} of {steps.length}
        </h1>
        <Input
          label={currentStep.label}
          type={currentStep.type}
          name={currentStep.field}
          placeholder={currentStep.placeholder}
          required={currentStep.field !== "company_name"}
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex items-center space-x-4">
          {step > 1 && <BackButton currentStep={step} />}
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
