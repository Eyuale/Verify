// frontend: ExistingProductReviewForm.tsx

"use client";

import { TProduct } from "@/lib/types";
import Button from "@/shared/components/button";
import Input from "@/shared/components/input";
import { ArrowLeft, ArrowRight, Loader2, Pen } from "lucide-react";
import React, { ChangeEvent, FormEvent, useState } from "react";
import StarRatingInput from "@/modules/product/component/rating_input";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 2;

const ExistingProductReviewForm = ({ product }: { product: TProduct }) => {
  const [step, setStep] = useState(1);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  // State for file upload
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    reviewDescription: "",
    rating: 0,
    videoUrl: "", // This will be used for pasted URLs
    // imageUrl: "", // Removed as it's not in the Review schema for this form
  });

  console.log("Selected Product for Review:", product);
  const handleClickNext = () => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const hanldeClickBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;

    // Handle file input for video
    if (
      name === "videoFile" &&
      target instanceof HTMLInputElement &&
      target.files &&
      target.files.length > 0
    ) {
      const file = target.files[0];
      setVideoFile(file); // Store the file object

      // Create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(localUrl);
      setVideoLoadError(false);

      // Clear the videoUrl text input if a file is selected
      setFormData((prev) => ({ ...prev, videoUrl: "" }));
    }
    // Handle URL input for video
    else if (name === "videoUrl") {
      setFormData((prev) => ({ ...prev, [name]: value })); // Update formData with the URL value

      if (value) {
        setVideoPreviewUrl(value);
        setVideoLoadError(false); // Reset error on new URL
      } else {
        setVideoPreviewUrl(null); // Clear preview if input is empty
        setVideoLoadError(false);
      }
      // Clear the file selection if a URL is being typed
      setVideoFile(null);
    }
    // Handle other regular text/textarea inputs
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler for StarRatingInput
  const handleRatingChange = (newRating: number) => {
    setFormData((prev) => ({ ...prev, rating: newRating }));
  };

  // Function to handle video loading errors (for both URL and local file previews)
  const handleVideoError = () => {
    setVideoLoadError(true);
    setVideoPreviewUrl(null); // Clear the broken video if you prefer
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
      let finalVideoUrl = formData.videoUrl; // Start with the URL from formData

      // Step 1: Upload video to S3 if a file is selected
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
        
        // Assuming uploadData.key contains the full URL or a path you can construct a URL from
        // If uploadData.key is just the key, you might need to prepend your S3 bucket URL
        finalVideoUrl = uploadData.key; 
      }

      const payload = {
        productId: product._id,
        userId: user.id,
        rating: formData.rating,
        reviewDescription: formData.reviewDescription,
        videoUrl: finalVideoUrl, // Use the final URL (pasted or uploaded)
      };

      // Step 2: Post the review data to our main reviews API
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong submitting review");

      // Redirect on success
      router.push("/");
    } catch (err: any) {
      console.error("Submission error:", err);
      alert(`Error: ${err.message || "An unexpected error occurred."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
        {step === 1 && (
          <div className="w-96">
            <label
              htmlFor="reviewDescription"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Your Review
            </label>
            <textarea
              id="reviewDescription"
              name="reviewDescription"
              onChange={handleChange}
              value={formData.reviewDescription}
              placeholder="e.g., Your experience with this product..."
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
            <StarRatingInput
              label="Rating"
              name="rating"
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              maxRating={5}
              required={true}
            />
          </div>
        )}
        {step === 2 && (
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