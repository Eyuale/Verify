"use client";
import { useRouter } from "next/navigation";
import Button from "@/shared/components/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  currentStep: number;
}

export default function BackButton({ currentStep }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/products/add?step=${currentStep - 1}`);
    }
  };

  return (
    <Button
      label="Back"
      type="button"
      icon={<ArrowLeft size={14} className="mr-2" />}
      className="bg-gray-200 text-gray-800"
      onClick={handleBack}
    />
  );
}
