// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema";
import { Product } from "@/models/productSchema"; // Ensure this import is present

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();
    console.log("Backend - Fetching review with ID:", params.id);

    const review = await Review.findById(params.id).populate("productId");
    console.log("Backend - Fetched review (after populate):", review);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const product = review.productId;

    console.log("Backend - Extracted Product object:", product); // <--- ADD THIS
    if (product) {
      console.log("Backend - Product videoUrl (from DB):", product.videoUrl); // <--- ADD THIS
    } else {
      console.log("Backend - Product is null or undefined after populate."); // <--- ADD THIS
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product associated with review not found" },
        { status: 404 },
      );
    }

    const safeReview = JSON.parse(JSON.stringify(review));
    const safeProduct = JSON.parse(JSON.stringify(product));

    return NextResponse.json({
      success: true,
      review: safeReview,
      product: safeProduct,
    });
  } catch (err) {
    console.error("GET /api/reviews/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review or associated product" },
      { status: 500 },
    );
  }
}
