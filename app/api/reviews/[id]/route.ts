// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Review } from "@/models/reviewSchema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();
    console.log(params.id);
    const review = await Review.findById(params.id);
    console.log(review);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "review not found" },
        { status: 404 },
      );
    }
    const safeReview = JSON.parse(JSON.stringify(review));
    return NextResponse.json({ success: true, review: safeReview });
  } catch (err) {
    console.error("GET /api/reviews/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}

//   export async function PUT(
//     req: NextRequest,
//     { params }: { params: { id: string } },
//   ) {
//     try {
//       await connectToDatabase();
//       const body = await req.json();
//       const updateFields: Partial<{
//         product_name: string;
//         description: string;
//         imageUrl: string;
//         price: number;
//         company_name?: string;
//         videoUrl?: string;
//       }> = {};

//       // Only pick allowed fields
//       for (const key of [
//         "product_name",
//         "description",
//         "imageUrl",
//         "price",
//         "company_name",
//         "videoUrl",
//       ] as const) {
//         if (key in body) {
//           updateFields[key] = body[key];
//         }
//       }

//       const updated = await Product.findByIdAndUpdate(params.id, updateFields, {
//         new: true,
//       }).lean();

//       if (!updated) {
//         return NextResponse.json(
//           { success: false, error: "Product not found" },
//           { status: 404 },
//         );
//       }

//       const safeUpdated = JSON.parse(JSON.stringify(updated));
//       return NextResponse.json({ success: true, product: safeUpdated });
//     } catch (err) {
//       console.error("PUT /api/products/[id] error:", err);
//       return NextResponse.json(
//         { success: false, error: "Failed to update product" },
//         { status: 500 },
//       );
//     }
//   }

//   export async function DELETE(
//     req: NextRequest,
//     { params }: { params: { id: string } },
//   ) {
//     try {
//       await connectToDatabase();
//       const deleted = await Product.findByIdAndDelete(params.id);
//       if (!deleted) {
//         return NextResponse.json(
//           { success: false, error: "Product not found" },
//           { status: 404 },
//         );
//       }
//       return NextResponse.json({ success: true });
//     } catch (err) {
//       console.error("DELETE /api/products/[id] error:", err);
//       return NextResponse.json(
//         { success: false, error: "Failed to delete product" },
//         { status: 500 },
//       );
//     }
//   }
