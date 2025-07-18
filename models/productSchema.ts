import { Schema, Types, model, models } from "mongoose";

// — Product schema now includes an array of reviews
const ProductSchema = new Schema(
  {
    product_name: { type: String, required: true },
    description: { type: String, required: false },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String, required: false },
    price: { type: Number, required: true },
    company_name: { type: String },
    model: { type: String, required: false }, // <-- Added model
    category: { type: String }, // <-- Added category
    userId: { type: String, required: true },
    ai_summary: { type: String, required: false },
    reviews: {
      type: [Types.ObjectId],
      ref: "Review",
    },
    webLink: { type: String, required: false },
  },
  { timestamps: true },
);

// Re-use compiled model if it exists (helps with hot reload in dev)
export const Product = models.Product || model("Product", ProductSchema);
