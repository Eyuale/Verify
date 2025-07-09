// models/reviewSchema.ts
import { Schema, model, models, Types } from "mongoose";

const CommentSchema = new Schema({
  avatar: { type: String },
  comment: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  imageUrl: { type: String, required: false },
  videoUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 },
  upvoteBy: [{ type: String }], // Store Clerk user IDs
  downvoteBy: [{ type: String }], // Store Clerk user IDs
  parentCommentId: { type: String, default: null }, // NEW: To link replies
  depth: { type: Number, default: 0 }, // NEW: To track nesting level
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
  },
  {
    timestamps: true,
  },
);

export const Review = models.Review || model("Review", ReviewSchema);