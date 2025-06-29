import { Schema, model, models } from "mongoose";

// — Review sub-document schema
const ReviewSchema = new Schema(
  {
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, required: true, maxlength: 500 },
    videoUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // each review gets its own ObjectId
);

// — Product schema now includes an array of reviews
const ProductSchema = new Schema(
  {
    product_name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    // videoUrl: { type: String },
    price: { type: Number, required: true },
    company_name: { type: String },
    model: { type: String, required: false }, // <-- Added model
    category: { type: String }, // <-- Added category
    userId: { type: String, required: true },
    reviews: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true }
);

// Re-use compiled model if it exists (helps with hot reload in dev)
export const Product = models.Product || model("Product", ProductSchema);
