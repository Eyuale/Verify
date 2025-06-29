// app/page.tsx
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/models/productSchema";
import ProductCard from "@/modules/product/ProductCard";

export default async function Home({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  // 1. Read any flash messages
  const { success, error } = searchParams;

  // 2. Fetch products with embedded reviews
  await connectToDatabase();
  const rawProducts = await Product.find(
    {},
    {
      product_name: 1,
      description: 1,
      imageUrl: 1,
      price: 1,
      company_name: 1,
      reviews: 1,
    },
  ).lean();
  const products = JSON.parse(JSON.stringify(rawProducts));

  // 3. Render
  return (
    <div className="mt-32 flex min-h-screen w-full flex-col items-center p-4">
      {success && <p className="mb-4 text-green-500">{success}</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {products.length === 0 ? (
        <p className="text-gray-500">
          No products found. <Link href="/new">Add a product</Link> to start
          reviewing!
        </p>
      ) : (
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4">
          {products.map((product: any) => {
            const pid = product._id;
            const reviews = Array.isArray(product.reviews)
              ? product.reviews
              : [];

            // compute videoUrls, averageRating, reviewCount
            const videoUrls = reviews
              .map((r: any) => r.videoUrl)
              .filter(Boolean) as string[];
            const total = reviews.reduce(
              (sum: number, r: any) => sum + (r.rating || 0),
              0,
            );
            const count = reviews.length;
            const averageRating = count
              ? parseFloat((total / count).toFixed(1))
              : 0;

            return (
              <ProductCard
                key={pid}
                id={pid}
                product_name={product.product_name}
                description={product.description}
                imageUrl={product.imageUrl}
                price={product.price}
                company_name={product.company_name}
                videoUrls={videoUrls}
                averageRating={averageRating}
                reviewCount={count}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
