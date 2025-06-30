// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";
import { getAuth } from "@clerk/nextjs/server"; // Import Clerk's server-side auth
import { TProduct } from "@/lib/types";

export async function POST(request: NextRequest) {
  // Server-side authentication with Clerk
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await connectToDatabase();
    const body: TProduct = await request.json();
    const { product_name, imageUrl, price, model, category, webLink, } = body;

    const newProduct = await Product.create({
      userId,
      product_name,
      imageUrl,
      price,
      model,
      category,
      webLink,
    })

    return NextResponse.json(
      { success: true, newProduct},
      { status: 201}
    )

  }catch(err){
    return NextResponse.json(
      { success: false, error: err},
      { status: 500 }
    )
  }
}
