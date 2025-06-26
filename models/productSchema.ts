import { Schema, models, model } from "mongoose";
import { T_PRODUCT_DOCUMENT } from "@/components/product/types/data"; // Make sure to update this type as well!

const productSchema = new Schema<T_PRODUCT_DOCUMENT>({
  product_name: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  rating: {
    // New field
    required: true, // Or false if you want it optional
    type: Number,
    min: 1,
    max: 5,
  },
  imageUrl: {
    required: true,
    type: String,
  },
  videoUrl: {
    // New field
    required: false, // Optional
    type: String,
  },
  price: {
    required: true,
    type: Number,
  },
  company_name: {
    type: String,
    required: false,
  },
  userId: {
    type: String,
    required: true,
  },
});

export const Product =
  models.Product || model<T_PRODUCT_DOCUMENT>("Product", productSchema);
