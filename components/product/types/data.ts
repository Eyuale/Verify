import { ObjectId } from "mongoose";

type T_PRODUCT = {
  id: string; // MongoDB _id as string
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
  videoUrls: string[];
  averageRating: number; // ← new
  reviewCount: number;
};

type T_PRODUCT_DOCUMENT = {
  _id: ObjectId; // <-- Add this line
  product_name: string;
  description: string;
  rating: number;
  imageUrl: string;
  videoUrl?: string;
  price: number;
  company_name?: string;
  userId: string;
};

export type { T_PRODUCT, T_PRODUCT_DOCUMENT };
