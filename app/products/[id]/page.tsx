// app/products/[id]/page.tsx
import Link from "next/link";
import Button from "@/shared/components/button";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";
import ProductVideoFeed from "@/modules/product/component/ProductVideoFeed";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Connect and fetch
  await connectToDatabase();
  const raw = await Product.findById(params.id).lean();
  if (!raw) {
    return <div className="p-8">Product not found.</div>;
  }
  const product = JSON.parse(JSON.stringify(raw));

  // Gather video URLs from embedded reviews
  const videoUrls: string[] = (product.reviews || [])
    .map((r: any) => r.videoUrl)
    .filter((v: string) => !!v);

  return (
    <div className="grid min-h-screen w-full grid-cols-2 pt-12">
      {/* Left: scrollable feed */}
      <div className="h-full w-full pl-2">
        <ProductVideoFeed videoUrls={videoUrls} posterUrl={product.imageUrl} />
      </div>

      {/* Right: product details */}
      <div className="flex-1 overflow-y-auto p-8">
        <Link href="/">
          <Button
            type="button"
            label="Back"
            icon={<ArrowLeft size={16} className="mr-2" />}
            className="bg-blue-50/70 pr-6 text-blue-600"
          />
        </Link>

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-semibold">{product.product_name}</h1>
          <p className="text-gray-700">{product.description}</p>
          <p className="text-blue-600">Price: ${product.price}</p>
          {product.company_name && (
            <p className="text-sm text-gray-500">
              Sold by {product.company_name}
            </p>
          )}
          {/* Additional details or reviews summary can go here */}
        </div>
      </div>
    </div>
  );
}
