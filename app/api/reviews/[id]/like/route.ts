// app/api/reviews/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  // Change reviewId to id here to match your folder name '[id]'
  { params }: { params: { id: string } },
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Destructure 'id' from params
  const { id } = params;

  try {
    await connectToDatabase();

    // Use 'id' to find the review
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    let newLikeCount = review.like || 0;
    const hasLiked = review.likedBy.includes(userId);

    if (hasLiked) {
      review.likedBy = review.likedBy.filter((_id: string) => _id !== userId);
      newLikeCount = Math.max(0, newLikeCount - 1);
    } else {
      review.likedBy.push(userId);
      newLikeCount = newLikeCount + 1;
    }

    review.like = newLikeCount;
    await review.save();

    return NextResponse.json(
      {
        success: true,
        newLikeCount: review.like,
        hasLiked: !hasLiked,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Error liking/unliking review:", err);
    let errorMessage = "Internal Server Error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
