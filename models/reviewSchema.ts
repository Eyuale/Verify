// models/reviewSchema.ts
import { Schema, model, models, Types } from "mongoose";

const CommentSchema = new Schema({
  comment: { type: String, required: true },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: false },
  videoUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  like: { type: Number, default: 0 },
  accurate: { type: Number, default: 0 },
  inaccurate: { type: Number, default: 0 },
});

const ReviewSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewDescription: { type: String, required: true, maxlength: 500 },
    videoUrl: { type: [String] },
    imageUrl: { type: [String] },
    accurate: { type: Number, default: 0 },
    inaccurate: { type: Number, default: 0 },
    comments: { type: [CommentSchema], required: false },
    createdAt: { type: Date, default: Date.now },
    // Add this new field to store user IDs who liked the review
    likedBy: {
      type: [String], // Array of Clerk user IDs
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Review = models.Review || model("Review", ReviewSchema);
