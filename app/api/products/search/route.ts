// app/api/products/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";

export async function GET(request: NextRequest) {
  // Extract the search query 'q' from the URL's search parameters.
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // If no query is provided, return an error.
  if (!query) {
    return NextResponse.json(
      { success: false, error: "Search query not provided." },
      { status: 400 }
    );
  }

  try {
    // Connect to the database.
    await connectToDatabase();

    const products = await Product.find({
      product_name: { $regex: query, $options: "i" },
    })
      .limit(10)
      .lean(); // .lean() returns plain JavaScript objects for better performance.

    // Return the found products.
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error("GET /api/products/search error:", err);
    return NextResponse.json(
      { success: false, error: "Server error while searching for products." },
      { status: 500 }
    );
  }
}
