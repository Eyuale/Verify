import { Schema, model, models, Types } from "mongoose";

const CommentSchema = new Schema({
    comment: { type: String, required: true },
    userId: { type: String, required: true },
    imageUrl: { type: String, required: false }, // Use String for single URL
    videoUrl: { type: String, required: false }, // Use String for single URL
    createdAt: { type: Date, default: Date.now },
    like: { type: Number, default: 0 },         // Corrected: type
    accurate: { type: Number, default: 0 },     // Corrected: type
    inaccurate: { type: Number, default: 0 },   // Corrected: type
});

const ReviewSchema = new Schema({
    productId: {
        type: Types.ObjectId,
        ref: "Product",
        required: true,
    },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewDescription: { type: String, required: true, maxlength: 500 },
    videoUrl: { type: [String] }, // Array of strings for multiple video URLs per review
    imageUrl: { type: [String] }, // Array of strings for multiple image URLs per review
    accurate: { type: Number, default: 0 },     // Corrected: type
    inaccurate: { type: Number, default: 0 },   // Corrected: type
    comments: { type: [CommentSchema], required: false }, // Embedded array of CommentSchema
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true, // Good practice for created/updated at Product level
});

// IMPORTANT: The model name for 'ref' should typically be singular (e.g., 'Review', 'Product')
// Mongoose often pluralizes the model name for the collection name automatically.
// If you use 'Reviews' here, your collection might be 'reviewses' or 'reviews'.
// If you intend the collection name to be 'Reviews', this is fine.
// But for consistency and common practice with 'ref', 'model("Review", ReviewSchema)' is more typical.
export const Review = models.Review || model("Review", ReviewSchema);