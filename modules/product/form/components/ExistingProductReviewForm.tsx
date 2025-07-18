// frontend: ExistingProductReviewForm.tsx

"use client";

import { TProduct } from "@/lib/types";
import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import { ArrowLeft, ArrowRight, Loader2, Pen } from "lucide-react";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react"; // Import useEffect
import StarRatingInput from "@/modules/product/component/rating_input";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Define an interface for the fetched category data
interface Question {
  type: "rating" | "text" | "boolean" | "select" | "radio" | "checkbox";
  label: string;
  key: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  placeholder?: string;
  conditional?: {
    field: string;
    value: unknown;
  };
}

interface Section {
  name: string;
  order: number;
  questions: Question[];
}

interface CategoryData {
  _id: string;
  categoryName: string;
  sections: Section[];
}

const TOTAL_STEPS = 3; // Initial general steps. We'll make this dynamic later.

const ExistingProductReviewForm = ({ product }: { product: TProduct }) => {
  const [step, setStep] = useState(1);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [videoFile, setVideoFile] = useState<File | null>(null);

  // New state for dynamic form questions and answers
  const [categoryReviewSections, setCategoryReviewSections] = useState<
    Section[]
  >([]);
  const [loadingCategoryData, setLoadingCategoryData] = useState(true);

  // State to hold answers for dynamic questions
  const [dynamicAnswers, setDynamicAnswers] = useState<{
    [key: string]: unknown;
  }>({});

  const [formData, setFormData] = useState({
    reviewDescription: "",
    rating: 0,
    videoUrl: "", // This will be used for pasted URLs
  });

  // --- New useEffect to fetch category-specific review questions ---
  useEffect(() => {
    const fetchCategoryQuestions = async () => {
      if (!product || !product.category) {
        setLoadingCategoryData(false);
        return;
      }
      setLoadingCategoryData(true);
      try {
        const response = await fetch(
          `/api/categories/${encodeURIComponent(product.category)}`, // New API endpoint
        );
        if (!response.ok) {
          throw new Error("Failed to fetch category review questions");
        }
        const data: CategoryData = await response.json();
        // Sort sections by their 'order' property
        const sortedSections = data.sections.sort((a, b) => a.order - b.order);
        setCategoryReviewSections(sortedSections);

        // Initialize dynamicAnswers with default values based on required questions
        const initialDynamicAnswers: { [key: string]: any } = {};
        sortedSections.forEach((section) => {
          section.questions.forEach((q) => {
            if (q.required && q.type === "rating") {
              initialDynamicAnswers[q.key] = 0; // Default rating to 0
            } else if (q.required && q.type === "text") {
              initialDynamicAnswers[q.key] = ""; // Default text to empty string
            } else if (q.required && q.type === "boolean") {
              initialDynamicAnswers[q.key] = false; // Default boolean to false
            }
            // Add other types as needed
          });
        });
        setDynamicAnswers(initialDynamicAnswers);

      } catch (error) {
        console.error("Error fetching category questions:", error);
        // Handle error: maybe show a message or fallback to a generic form
      } finally {
        setLoadingCategoryData(false);
      }
    };

    fetchCategoryQuestions();
  }, [product]); // Re-fetch if the product changes

  // Adjust TOTAL_STEPS dynamically:
  // 1 (Description/Rating) + N (Dynamic Sections) + 1 (Video Upload)
  const dynamicTotalSteps =
    1 + categoryReviewSections.length + (categoryReviewSections.length > 0 ? 1 : 0); // At least 3 steps, if there are no dynamic sections then there are the current 3 steps.

  console.log("Selected Product for Review:", product);

  // --- Handler for dynamic input changes ---
  const handleDynamicInputChange = (key: string, value: any) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClickNext = () => {
    // Basic validation before moving to next step
    if (step === 1) {
      if (!formData.reviewDescription.trim() || formData.rating === 0) {
        alert("Please provide a description and a rating.");
        return;
      }
    } else if (step > 1 && step <= categoryReviewSections.length + 1) {
      // Validate dynamic questions for the current dynamic step
      const currentDynamicSectionIndex = step - 2; // Step 2 is the first dynamic section
      if (currentDynamicSectionIndex >= 0 && currentDynamicSectionIndex < categoryReviewSections.length) {
        const currentSection = categoryReviewSections[currentDynamicSectionIndex];
        for (const question of currentSection.questions) {
          // Only validate if the question is currently visible (no conditional field or condition met)
          const isQuestionVisible = !question.conditional || (dynamicAnswers[question.conditional.field] === question.conditional.value);

          if (question.required && isQuestionVisible) {
            const answer = dynamicAnswers[question.key];
            if (answer === undefined || answer === null || (typeof answer === 'string' && !answer.trim()) || (typeof answer === 'number' && answer === 0 && question.type === 'rating')) {
              alert(`Please answer the required question: "${question.label}" in the '${currentSection.name}' section.`);
              return; // Prevent moving to next step
            }
          }
        }
      }
    }

    setStep((prev) => Math.min(prev + 1, dynamicTotalSteps)); // Use dynamicTotalSteps
  };

  const hanldeClickBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;

    if (
      name === "videoFile" &&
      target instanceof HTMLInputElement &&
      target.files &&
      target.files.length > 0
    ) {
      const file = target.files[0];
      setVideoFile(file);

      const localUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(localUrl);
      setVideoLoadError(false);
      setFormData((prev) => ({ ...prev, videoUrl: "" }));
    } else if (name === "videoUrl") {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (value) {
        setVideoPreviewUrl(value);
        setVideoLoadError(false);
      } else {
        setVideoPreviewUrl(null);
        setVideoLoadError(false);
      }
      setVideoFile(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRatingChange = (newRating: number) => {
    setFormData((prev) => ({ ...prev, rating: newRating }));
  };

  const handleVideoError = () => {
    setVideoLoadError(true);
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isUserLoaded || !user) {
      alert("You must be logged in to submit a review.");
      setIsSubmitting(false);
      return;
    }

    try {
      let finalVideoUrl = formData.videoUrl;

      if (videoFile) {
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

        const s3Res = await fetch(uploadData.url, {
          method: "PUT",
          body: videoFile,
          headers: { "Content-Type": videoFile.type },
        });
        if (!s3Res.ok) throw new Error("Video upload to S3 failed");

        finalVideoUrl = uploadData.key;
      }

      // Combine static formData and dynamicAnswers
      const payload = {
        productId: product._id,
        userId: user.id,
        rating: formData.rating,
        reviewDescription: formData.reviewDescription,
        videoUrl: finalVideoUrl,
        featureRatings: dynamicAnswers, // Include dynamic answers here!
      };

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Something went wrong submitting review",
        );

      router.push("/");
    } catch (err: unknown) {
      console.error("Submission error:", err);
      if (err && typeof err === "object" && "message" in err) {
        alert(`Error: ${(err as { message?: string }).message || "An unexpected error occurred."}`);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCategoryData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
        <p className="ml-2">Loading review form...</p>
      </div>
    );
  }

  // Determine which dynamic section to show based on the current step
  const currentDynamicSectionIndex = step - 2; // Step 2 is the first dynamic section
  const currentDynamicSection =
    currentDynamicSectionIndex >= 0 &&
    currentDynamicSectionIndex < categoryReviewSections.length
      ? categoryReviewSections[currentDynamicSectionIndex]
      : null;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
        {/* Step 1: General Review Description and Overall Rating */}
        {step === 1 && (
          <div className="w-96">
            <h3 className="text-xl font-semibold mb-4">
              Reviewing {product.product_name}
            </h3>
            <label
              htmlFor="reviewDescription"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Your Overall Review
            </label>
            <textarea
              id="reviewDescription"
              name="reviewDescription"
              onChange={handleChange}
              value={formData.reviewDescription}
              placeholder="e.g., Your overall experience with this product..."
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
            <StarRatingInput
              label="Overall Rating"
              name="rating"
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              maxRating={5}
              required={true}
            />
          </div>
        )}

        {/* Dynamic Steps: Render based on categoryReviewSections */}
        {currentDynamicSection && (
          <div className="w-96">
            <h3 className="text-xl font-semibold mb-4">
              {currentDynamicSection.name}
            </h3>
            {currentDynamicSection.questions.map((q) => {
              // Implement conditional rendering for questions
              const isQuestionVisible = !q.conditional || (dynamicAnswers[q.conditional.field] === q.conditional.value);

              if (!isQuestionVisible) return null; // Don't render if conditional is not met

              switch (q.type) {
                case "rating":
                  return (
                    <div key={q.key} className="mb-4">
                      <StarRatingInput
                        label={q.label}
                        name={q.key}
                        rating={dynamicAnswers[q.key] || 0}
                        onRatingChange={(newRating) =>
                          handleDynamicInputChange(q.key, newRating)
                        }
                        maxRating={q.max || 5}
                        required={q.required}
                      />
                    </div>
                  );
                case "text":
                  return (
                    <div key={q.key} className="mb-4">
                      <label
                        htmlFor={q.key}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        {q.label}
                      </label>
                      <textarea
                        id={q.key}
                        name={q.key}
                        onChange={(e) =>
                          handleDynamicInputChange(e.target.name, e.target.value)
                        }
                        value={dynamicAnswers[q.key] || ""}
                        placeholder={q.placeholder}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        required={q.required}
                      />
                    </div>
                  );
                case "boolean":
                  return (
                    <div key={q.key} className="mb-4 flex items-center">
                      <input
                        type="checkbox"
                        id={q.key}
                        name={q.key}
                        checked={dynamicAnswers[q.key] || false}
                        onChange={(e) =>
                          handleDynamicInputChange(q.key, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required={q.required}
                      />
                      <label
                        htmlFor={q.key}
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        {q.label}
                      </label>
                    </div>
                  );
                case "select":
                  return (
                    <div key={q.key} className="mb-4">
                      <label htmlFor={q.key} className="mb-1 block text-sm font-medium text-gray-700">
                        {q.label}
                      </label>
                      <select
                        id={q.key}
                        name={q.key}
                        value={dynamicAnswers[q.key] || ''}
                        onChange={(e) => handleDynamicInputChange(q.key, e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        required={q.required}
                      >
                        <option value="">Select an option</option>
                        {q.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  );
                case "radio":
                    return (
                        <div key={q.key} className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {q.label} {q.required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="mt-2 space-y-2">
                                {q.options?.map(option => (
                                    <div key={`${q.key}-${option}`} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`${q.key}-${option}`}
                                            name={q.key}
                                            value={option}
                                            checked={dynamicAnswers[q.key] === option}
                                            onChange={(e) => handleDynamicInputChange(q.key, e.target.value)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            required={q.required && dynamicAnswers[q.key] === undefined} // Only required if no option is selected yet
                                        />
                                        <label htmlFor={`${q.key}-${option}`} className="ml-2 block text-sm text-gray-900">
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                case "checkbox":
                    return (
                        <div key={q.key} className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {q.label} {q.required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="mt-2 space-y-2">
                                {q.options?.map(option => (
                                    <div key={`${q.key}-${option}`} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${q.key}-${option}`}
                                            name={q.key}
                                            value={option}
                                            checked={Array.isArray(dynamicAnswers[q.key]) && dynamicAnswers[q.key].includes(option)}
                                            onChange={(e) => {
                                                const currentSelection = Array.isArray(dynamicAnswers[q.key]) ? [...dynamicAnswers[q.key]] : [];
                                                if (e.target.checked) {
                                                    handleDynamicInputChange(q.key, [...currentSelection, option]);
                                                } else {
                                                    handleDynamicInputChange(q.key, currentSelection.filter(item => item !== option));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={`${q.key}-${option}`} className="ml-2 block text-sm text-gray-900">
                                            {option}
                                        </label>
                                    </div>
                                ))}
                                {q.required && Array.isArray(dynamicAnswers[q.key]) && dynamicAnswers[q.key].length === 0 && (
                                  <p className="text-red-500 text-xs mt-1">Please select at least one option.</p>
                                )}
                            </div>
                        </div>
                    );
                default:
                  return null; // Handle unknown question types gracefully
              }
            })}
          </div>
        )}

        {/* Final Step: Video Upload */}
        {step === dynamicTotalSteps && (
          <div className="w-96">
            {/* Input for Video URL */}
            <Input
              label="Video URL (Paste Link)"
              name="videoUrl"
              onChange={handleChange}
              value={formData.videoUrl}
              placeholder="e.g., https://www.youtube.com/watch?v=..."
            />

            <div className="my-4 text-center text-gray-500">— OR —</div>

            {/* Input for Video File Upload */}
            <label
              htmlFor="videoFileUpload"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Upload Video File
            </label>
            <input
              id="videoFileUpload"
              type="file"
              name="videoFile"
              accept="video/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              key={videoFile ? videoFile.name : "no-file"}
            />

            {/* Video Preview Section */}
            {videoPreviewUrl && (
              <div className="mt-4 rounded-md border border-gray-300 p-2">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Video Preview:
                </p>
                <video
                  src={videoPreviewUrl}
                  controls
                  className="h-auto max-w-full rounded-md object-contain"
                  onError={handleVideoError}
                  style={{ maxHeight: "200px" }}
                >
                  Your browser does not support the video tag.
                </video>
                {videoLoadError && (
                  <p className="mt-2 text-sm text-red-500">
                    Could not load video. Please check the URL or try another
                    file.
                  </p>
                )}
              </div>
            )}
            {!videoPreviewUrl && !videoFile && (
              <p className="mt-4 text-sm text-gray-500">
                No video selected for preview.
              </p>
            )}
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

          {step < dynamicTotalSteps && (
            <Button
              label="Next"
              type="button"
              onClick={handleClickNext}
              icon={<ArrowRight size={16} />}
              className="bg-blue-600 text-white"
            />
          )}

          {step === dynamicTotalSteps && (
            <Button
              label={isSubmitting ? "Submitting..." : "Submit Review"}
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

export default ExistingProductReviewForm;