"use server";
import { connectToDatabase } from "@/utils/db";
import { Product } from "@/models/productSchema";
import { getSession, saveSession } from "@/utils/session";

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
    const fieldName = Array.from(formData.keys())[0];
    const fieldValue = formData.get(fieldName);

    if (typeof fieldValue !== "string" || fieldValue === null) {
      throw new Error(`Invalid input for ${fieldName}: Expected string`);
    }

    session.formData = { ...session.formData, [fieldName]: fieldValue };
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
    const data: Record<string, string> = {
      ...session.formData,
      ...Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key,
          value instanceof File ? "" : String(value),
        ])
      ),
    };

    const {
      product_name,
      description,
      imageUrl,
      price: priceStr,
      company_name,
    } = data;

    if (!product_name || !description || !imageUrl || !priceStr) {
      return { success: false, error: "Missing required fields" };
    }

    const parsedPrice = parseFloat(priceStr);
    if (isNaN(parsedPrice)) {
      return { success: false, error: "Invalid price" };
    }

    await connectToDatabase();
    const newProduct = new Product({
      product_name,
      description,
      imageUrl,
      price: parsedPrice,
      company_name,
    });
    await newProduct.save();

    // Clear session
    session.formData = {};
    await saveSession(session);

    return { success: true, product: newProduct.toObject() };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
