import { connectToDatabase } from "@/utils/db";
import { Product } from "@/models/productSchema";
import ProductCard from "@/components/product/product";
import { T_PRODUCT_DOCUMENT } from "@/components/product/data/data";
import { Suspense } from "react";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  await connectToDatabase();
  const products = (await Product.find({}).lean()) as T_PRODUCT_DOCUMENT[];
  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 mt-32">
      {searchParams.success && (
        <p className="text-green-500 mb-4">{searchParams.success}</p>
      )}
      {searchParams.error && (
        <p className="text-red-500 mb-4">{searchParams.error}</p>
      )}

      <Suspense fallback={<p>Loading products...</p>}>
        {products.length === 0 ? (
          <p className="text-gray-500">
            No products found. Add a product to start reviewing!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                product_name={product.product_name}
                description={product.description}
                imageUrl={product.imageUrl}
                price={product.price}
                company_name={product.company_name}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
