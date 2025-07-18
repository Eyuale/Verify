// app/api/categories/[categoryName]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Category } from "@/models/categorySchema"; // Import your Category model

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ categoryName: string }> },
) {
  try {
    await connectToDatabase();

    const { categoryName } = await context.params;

    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    // Decode the category name (e.g., if it contains spaces like "Smart Home Devices")
    const decodedCategoryName = decodeURIComponent(categoryName);

    const categoryData = await Category.findOne({
      categoryName: decodedCategoryName,
    }).lean(); // Use .lean() for faster retrieval if you don't need Mongoose document methods

    if (!categoryData) {
      return NextResponse.json(
        {
          success: false,
          error: `Category '${decodedCategoryName}' not found`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, ...categoryData }, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching category questions:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}