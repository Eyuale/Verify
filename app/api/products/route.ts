// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";
import { getAuth } from "@clerk/nextjs/server"; // Import Clerk's server-side auth

// Define the shape of a single review
interface Review {
  userId: string;
  rating: number;
  description: string;
  videoUrl?: string;
}

// Define the shape of the data for a new product
interface ProductData {
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
}

// Define the shape of the incoming request body from our form
interface RequestBody {
  isNew: boolean;
  productId?: string;
  productData: ProductData;
  reviewData: Review;
}

export async function POST(request: NextRequest) {
  // Server-side authentication with Clerk
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const body: RequestBody = await request.json();
    const { isNew, productId, productData, reviewData } = body;

    // Double-check that the userId from the client matches the authenticated user
    if (userId !== reviewData.userId) {
      return NextResponse.json(
        { success: false, error: "User ID mismatch." },
        { status: 403 }
      );
    }

    let product;

    if (isNew) {
      // --- SCENARIO 1: CREATE NEW PRODUCT ---
      if (!productData.product_name) {
        throw new Error("Product name is required for a new product.");
      }
      product = await Product.create({
        ...productData,
        reviews: [reviewData], // Create the product with its first review
      });
    } else {
      // --- SCENARIO 2: ADD REVIEW TO EXISTING PRODUCT ---
      if (!productId) {
        throw new Error("Product ID is required to add a new review.");
      }
      // Find the product and push the new review in a single, atomic operation
      product = await Product.findByIdAndUpdate(
        productId,
        { $push: { reviews: reviewData } }, // $push adds the item to the array
        { new: true, runValidators: true } // 'new: true' returns the updated document
      );

      if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found." },
          { status: 404 }
        );
      }
    }

    const safeProduct = JSON.parse(JSON.stringify(product));
    return NextResponse.json(
      { success: true, product: safeProduct },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
