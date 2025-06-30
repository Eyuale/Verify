// app/api/reviews/route.ts (Note: Your original path was app/api/review/route.ts, changed to plural for consistency)

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema"; // Assuming this path is correct
import { Product } from "@/models/productSchema"; // <--- Import the Product model
import { getAuth } from "@clerk/nextjs/server";
import { TReviews } from "@/lib/types"; // Assuming TReviews is defined and matches your payload

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await connectToDatabase();
    const body: TReviews = await request.json();
    const { productId, rating, reviewDescription, videoUrl } = body; // userId is from Clerk's getAuth

    // 1. Create the new review
    const newReview = await Review.create({
      productId,
      userId, // Use userId from Clerk's getAuth for consistency and security
      rating,
      reviewDescription,
      videoUrl,
    });

    // 2. Find the product and add the new review's ID to its reviews array
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: newReview._id } }, // Atomically push the new review's ID
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      // If product not found, you might want to delete the created review or handle it differently
      console.error(`Product with ID ${productId} not found for review ${newReview._id}`);
      // Optionally, delete the review if the product doesn't exist
      await Review.findByIdAndDelete(newReview._id);
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, newReview, updatedProduct }, // Optionally return updated product
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Error creating review or updating product:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}