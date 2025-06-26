"use server";
import { connectToDatabase } from "@/utils/db";
import { Product } from "@/models/productSchema";
import { getSession, saveSession } from "@/utils/session";
import { currentUser } from "@clerk/nextjs/server";

export interface ActionResponse {
  success: boolean;
  product?: any;
  error?: string;
}

export const handleStepAction = async (
  formData: FormData,
  currentStep: number
) => {
  try {
    const session = await getSession();
    let currentStepData: Record<string, string> = {};

    // Iterate over all entries in the formData
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value !== null) {
        currentStepData[key] = value;
      } else {
        console.warn(
          `handleStepAction: Skipping non-string or null value for key: ${key}`
        );
        currentStepData[key] = "";
      }
    }

    session.formData = { ...session.formData, ...currentStepData };
    await saveSession(session);
  } catch (error) {
    throw new Error(
      `Failed to save step ${currentStep}: ${(error as Error).message}`
    );
  }
};

export const productFormAction = async (
  formData: FormData
): Promise<ActionResponse> => {
  try {
    const session = await getSession();
    const user = await currentUser();

    console.log("user id:", user?.id);

    // Aggregate all data from session and current formData
    const data: Record<string, string> = {
      ...session.formData,
      ...Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key,
          value instanceof File ? "" : String(value), // Still treating File as empty string for now
        ])
      ),
    };

    const {
      product_name,
      description,
      rating: ratingStr, // New: Get rating as string
      imageUrl,
      videoUrl, // New: Get video URL
      price: priceStr,
      company_name,
    } = data;

    // Basic validation for required fields (adjust as per your schema)
    if (!product_name || !description || !ratingStr || !imageUrl || !priceStr) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate and parse rating
    const parsedRating = parseInt(ratingStr);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return {
        success: false,
        error: "Invalid rating. Must be between 1 and 5.",
      };
    }

    // Validate and parse price
    const parsedPrice = parseFloat(priceStr);
    if (isNaN(parsedPrice)) {
      return { success: false, error: "Invalid price" };
    }

    await connectToDatabase();
    const newProduct = await new Product({
      product_name,
      description,
      rating: parsedRating, // Use parsed rating
      imageUrl,
      videoUrl: videoUrl || null, // Allow null if not provided
      price: parsedPrice,
      company_name: company_name || null, // Allow null if not provided
      userId: user?.id,
    });
    await newProduct.save();

    console.log("New Product Created:", newProduct);

    // Clear session data after successful submission
    session.formData = {};
    await saveSession(session);

    return { success: true, product: newProduct.toObject() };
  } catch (error) {
    console.error("Error in productFormAction:", error);
    return { success: false, error: (error as Error).message };
  }
};
