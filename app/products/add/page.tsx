// app/products/add/page.tsx
import ProductForm from "@/components/product/component/ProductForm";
import { Suspense } from "react";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: { step?: string; error?: string; success?: string };
}) {
  return (
    <div className="min-h-screen p-8">
      {searchParams.success && (
        <p className="text-green-500 mb-4">{searchParams.success}</p>
      )}
      {searchParams.error && (
        <p className="text-red-500 mb-4">{searchParams.error}</p>
      )}

      <Suspense fallback={<p>Loading form…</p>}>
        <ProductForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
