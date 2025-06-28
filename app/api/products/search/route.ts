// app/api/products/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category"); // <-- Get category from query params

  if (!query && !category) {
    return NextResponse.json(
      { success: false, error: "Search query or category must be provided." },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const filter: any = {};
    if (query) {
      filter.product_name = { $regex: query, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).limit(10).lean();

    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error("GET /api/products/search error:", err);
    return NextResponse.json(
      { success: false, error: "Server error while searching for products." },
      { status: 500 }
    );
  }
}
