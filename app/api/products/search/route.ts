import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest){
  // Extract the 'query' parameter from the URL's search params
  const query = req.nextUrl.searchParams.get("query")

  if(!query){
      return NextResponse.json({
        success: false, error: "Search query must be provided."
      }, { status: 400})
  }

  try {
      await connectToDatabase();

      const products = await Product.find({
      $or: [
        { product_name: { $regex: query, $options: 'i' } }, // Case-insensitive search
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).lean();

    return NextResponse.json(
      { success: true, products},
      { status: 200}
    )

  } catch(err){
      console.error("GET /api:", err);
      return NextResponse.json(
      { success: false, error: "Server error while searching for products." },
      { status: 500 },
      );
  }
}