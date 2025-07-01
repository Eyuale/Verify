// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema";

// Corrected function signature and logic for GET
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // Await the params to get the id
  const { id } = await context.params;

  try {
    await connectToDatabase();
    const review = await Review.findById(id).lean();

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, review });
  } catch (err: unknown) {
    console.error("GET /api/reviews/[id] error:", err);
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