import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import { getAuth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/utils/db";
import { Product } from "@/models/productSchema";
import { T_PRODUCT_DOCUMENT } from "@/components/product/types/data"; // Make sure to import your type

export async function POST(req: NextRequest) {
  // Change Request to NextRequest
  try {
    // 1. Authenticate the user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse the incoming JSON data
    const body: T_PRODUCT_DOCUMENT = await req.json();

    console.log(body);
    const {
      product_name,
      description,
      rating,
      imageUrl,
      videoUrl,
      price,
      company_name,
    } = body;

    // 3. Validate the data
    if (!product_name || !description || !rating || !imageUrl || !price) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid rating. Must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    // 4. Connect to the database
    await connectToDatabase();

    // 5. Create and save the new product
    const newProduct = new Product({
      product_name,
      description,
      rating,
      imageUrl,
      videoUrl: videoUrl || null,
      price,
      company_name: company_name || null,
      userId: userId, // Add the authenticated user's ID
    });

    await newProduct.save();

    console.log("New Product Created:", newProduct);

    // 6. Return a success response
    return NextResponse.json(
      { success: true, product: newProduct.toObject() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
