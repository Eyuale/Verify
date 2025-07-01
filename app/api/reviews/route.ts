// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema";
import { Product } from "@/models/productSchema";
import { getAuth } from "@clerk/nextjs/server";
import { TReviews } from "@/lib/types";

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
    const { productId, rating, reviewDescription, videoUrl } = body;

    const newReview = await Review.create({
      productId,
      userId,
      rating,
      reviewDescription,
      videoUrl,
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: newReview._id } },
      { new: true },
    );

    if (!updatedProduct) {
      console.error(
        `Product with ID ${productId} not found for review ${newReview._id}`,
      );
      await Review.findByIdAndDelete(newReview._id);
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, newReview, updatedProduct },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Error creating review or updating product:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    // Explicitly select the 'likedBy' field
    const reviews = await Review.find({}).select("+likedBy");

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err,
      },
      { status: 500 },
    );
  }
}
