// app/api/reviews/route.ts (update this file)
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema"; // Make sure this path is correct
import { getAuth } from "@clerk/nextjs/server";
import { Product } from "@/models/productSchema"; // If you need to update Product with new review reference

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
    const body = await request.json();
    // Destructure all expected fields, including the new featureRatings
    const { productId, rating, reviewDescription, videoUrl, featureRatings } =
      body;

    if (!productId || !rating || !reviewDescription) {
      return NextResponse.json(
        { success: false, error: "Missing required review fields" },
        { status: 400 },
      );
    }

    const newReview = await Review.create({
      productId,
      userId,
      rating,
      reviewDescription,
      videoUrl,
      featureRatings, // Save the dynamic feature ratings
    });

    // Optionally, if you also want to update the Product document with the new review ID
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: newReview._id },
    });

    return NextResponse.json({ success: true, newReview }, { status: 201 });
  } catch (err: unknown) {
    console.error("Error creating review:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Server Error" },
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
