import { Schema, models, model, Document } from "mongoose";
import { T_PRODUCT_DOCUMENT } from "@/components/product/data/data";

const productSchema = new Schema<T_PRODUCT_DOCUMENT>({
  product_name: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  imageUrl: {
    required: true,
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
});

export const Product =
  models.Product || model<T_PRODUCT_DOCUMENT>("Product", productSchema);
