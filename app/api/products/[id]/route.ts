// app/api/products/[id]/route.ts
import { connectToDatabase } from "@/lib/mongoose";
import { TProduct, TReviews } from "@/lib/types";
import { Product } from "@/models/productSchema";
import { Review } from "@/models/reviewSchema";
import { NextRequest, NextResponse } from "next/server";

// Corrected function signature and logic for GET
export async function GET(
  req: NextRequest,
  // Type the params as a Promise
  context: { params: Promise<{ id: string }> },
) {
  // Await the params to get the id
  const { id } = await context.params;

  try {
    await connectToDatabase();
    // ... (rest of your GET logic is correct)
    const product: TProduct | null = (await Product.findById(id).lean()) as TProduct | null;

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    let reviews: TReviews[] = [];
    if (product.reviews && product.reviews.length > 0) {
      reviews = (await Review.find({ _id: { $in: product.reviews } }).lean() as unknown) as TReviews[];
    }
    
    console.log(product, reviews);

    const safeProduct = product;
    const safeReviews = reviews;

    return NextResponse.json({ success: true, product: safeProduct, reviews: safeReviews });
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// Corrected function signature and logic for PUT
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    await connectToDatabase();
    const body = await req.json();
    const updateFields: Partial<TProduct> = {};

    const allowedKeys: (keyof TProduct)[] = [
      "product_name",
      "description",
      "imageUrl",
      "videoUrl",
      "price",
      "company_name",
      "model",
      "category",
      "ai_summary",
      "webLink",
    ];

    for (const key of allowedKeys) {
      if (key in body) {
        (updateFields as Partial<TProduct>)[key as keyof TProduct] = body[key];
      }
    }

    const updated: TProduct | null = (await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).lean()) as TProduct | null;

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const safeUpdated = JSON.parse(JSON.stringify(updated));
    return NextResponse.json({ success: true, product: safeUpdated });
  } catch (err) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// Corrected function signature and logic for DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    await connectToDatabase();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}