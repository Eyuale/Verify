// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";
import { Review } from "@/models/reviewSchema";
import { TProduct, TReviews } from "@/lib/types"; // Make sure these are updated

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();
    console.log(params.id);

    // This cast will now work correctly if TProduct includes _id, createdAt, etc.
    const product: TProduct | null = (await Product.findById(params.id).lean()) as TProduct | null;

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    let reviews: TReviews[] = [];
    if (product.reviews && product.reviews.length > 0) {
      // This cast will now work correctly if TReviews includes productId, userId, createdAt, etc.
      reviews = (await Review.find({ _id: { $in: product.reviews } }).lean() as unknown) as TReviews[];
    }
    
    console.log(product, reviews);

    const safeProduct = JSON.parse(JSON.stringify(product));
    const safeReviews = JSON.parse(JSON.stringify(reviews)); 

    return NextResponse.json({ success: true, product: safeProduct, reviews: safeReviews });
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// ... (rest of the PUT and DELETE functions remain the same)

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updateFields: Partial<TProduct> = {}; // Use Partial<TProduct> for update fields

    // Only pick allowed fields that are part of TProduct
    // Dynamically derive keys from TProduct to make it more robust
    const allowedKeys: (keyof TProduct)[] = [
      "product_name",
      "description",
      "imageUrl",
      "videoUrl", // Assuming videoUrl is part of TProduct
      "price",
      "company_name",
      "model",
      "category",
      "ai_summary", // Include if updatable
      "webLink",    // Include if updatable
    ];

    for (const key of allowedKeys) {
      if (key in body) {
        // Ensure type compatibility when assigning
        (updateFields as any)[key] = body[key]; 
      }
    }

    const updated: TProduct | null = (await Product.findByIdAndUpdate(params.id, updateFields, {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();
    const deleted = await Product.findByIdAndDelete(params.id);
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