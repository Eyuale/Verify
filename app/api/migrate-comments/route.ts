// File: app/api/migrate-comments/route.ts

import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    console.log("[BACKEND MIGRATION] Starting migration...");

    const result = await Review.updateMany(
      {
        // Query to find reviews that contain comments where 'likedBy' field does not exist
        // This query itself doesn't cause the schema path error, but identifies the documents.
        "comments.likedBy": { $exists: false }
      },
      {
        $set: {
          // Use the positional operator with arrayFilters
          "comments.$[elem].likedBy": [],
          "comments.$[elem].accurateBy": [],
          "comments.$[elem].inaccurateBy": [],
        },
      },
      {
        // arrayFilters: Crucial for targeting specific elements within the 'comments' array
        arrayFilters: [
          { "elem.likedBy": { $exists: false } } // Only apply $set to comments where 'likedBy' does not exist
        ],
        // !!! ADD THIS OPTION !!!
        strict: false // Bypass strict schema validation for this update operation
      }
    );

    console.log(`[BACKEND MIGRATION] Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.matchedCount === 0 && result.modifiedCount === 0) {
      return NextResponse.json({ message: "No comments found needing migration. They likely already have the fields or no comments exist yet." }, { status: 200 });
    }

    return NextResponse.json({ message: "Migration successful", result }, { status: 200 });
  } catch (error: any) {
    console.error("[BACKEND MIGRATION] Migration failed:", error);
    return NextResponse.json({ error: "Migration failed", details: error.message }, { status: 500 });
  }
}