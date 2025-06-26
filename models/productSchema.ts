import { Schema, models, model } from "mongoose";

const productSchema = new Schema({
  //   email: {
  //     required: true,
  //     type: String,
  //     unique: true,
  //   },
  //   username: {
  //     required: true,
  //     type: String,
  //     unique: true,
  //   },
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

export const Product = models.Product || model("Product", productSchema);
