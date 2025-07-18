// models/reviewSchema.ts
import { Schema, model, models, Types, Document } from "mongoose";

// This interface represents the *plain data* structure of a comment,
// INCLUDING the _id, as it's present after .toObject().
// This is the shape you expect when sending data to/from frontend or after .toObject().
export interface IPlainComment {
  _id: Types.ObjectId; // Crucial for when you convert to a plain object
  avatar?: string;
  comment: string;
  userId: string;
  username: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  upvote: number;
  downvote: number;
  upvoteBy: string[];
  downvoteBy: string[];
  parentCommentId: string | null;
  depth: number;
}

// Interface for Comment Subdocument.
// It extends Document, which provides Mongoose methods and its own _id definition.
// We then use Omit<IPlainComment, '_id'> to get all fields from IPlainComment *except* _id,
// preventing the _id conflict. The _id property on IComment will come from Document.
export interface IComment extends Document, Omit<IPlainComment, "_id"> {
  // TypeScript will implicitly get _id from Document.
  // All other properties are inherited from Omit<IPlainComment, '_id'>.
  // If you need to specifically override or add properties that are part of IPlainComment,
  // but with slightly different typing in the Document context, you can add them here.
  // For _id, Document's definition is usually sufficient.
}

// Interface for Review Document
export interface IReview extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: string;
  rating: number;
  reviewDescription: string;
  videoUrl?: string[];
  imageUrl?: string[];
  accurate: number;
  inaccurate: number;
  comments: Types.DocumentArray<IComment>; // Use DocumentArray for subdocuments
  createdAt: Date;
  updatedAt: Date; // Added by timestamps: true
  // ADDED: Define featureRatings in the interface
  featureRatings: Record<string, unknown>; // Using Record<string, unknown> to match Schema.Types.Mixed safely
}

const CommentSchema = new Schema<IComment>({
  avatar: { type: String },
  comment: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  imageUrl: { type: String, required: false },
  videoUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 },
  upvoteBy: [{ type: String }],
  downvoteBy: [{ type: String }],
  parentCommentId: { type: String, default: null },
  depth: { type: Number, default: 0 },
});

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
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
    createdAt: { type: Date, default: Date.now }, // Dynamic answers to feature-specific questions
    // This field will store the key-value pairs of answers (e.g., { "overall_rating": 4, "camera_quality": 5, "pros": "Great battery" })
    featureRatings: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

export const Review = models.Review || model<IReview>("Review", ReviewSchema);
