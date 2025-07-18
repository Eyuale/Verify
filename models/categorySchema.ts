// models/CategorySchema.ts (or schemas/CategorySchema.ts)

import { Schema, model, models } from "mongoose";

// Sub-schema for individual review questions
const QuestionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["rating", "text", "boolean", "select", "radio", "checkbox"], // Define allowed types
  },
  label: { type: String, required: true }, // The question text displayed to the user
  key: { type: String, required: true, unique: false }, // The field name for storing the answer (e.g., "camera_quality")
  required: { type: Boolean, default: false }, // Is this question mandatory?
  min: { type: Number }, // For rating types: minimum value
  max: { type: Number }, // For rating types: maximum value
  options: [{ type: String }], // For select/radio/checkbox types: array of possible answers
  placeholder: { type: String }, // For text types: placeholder text
  conditional: {
    // Optional: for questions that only show based on another answer
    field: { type: String }, // The 'key' of the preceding question
    value: Schema.Types.Mixed, // The value of the preceding question that triggers this one
  },
});

// Sub-schema for review sections (e.g., "Performance", "Camera")
const SectionSchema = new Schema({
  name: { type: String, required: true }, // The name of the section (e.g., "Performance")
  order: { type: Number, required: true }, // Order for displaying sections
  questions: [QuestionSchema], // Array of questions within this section
});

// Main Category Schema
const CategorySchema = new Schema(
  {
    categoryName: { type: String, required: true, unique: true }, // e.g., "Smartphones"
    description: { type: String, required: false },
    sections: [SectionSchema], // Array of review sections for this category
  },
  { timestamps: true }, // Adds createdAt and updatedAt timestamps
);

// Re-use compiled model if it exists (helps with hot reload in dev)
export const Category = models.Category || model("Category", CategorySchema);