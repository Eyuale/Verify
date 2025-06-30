// app/products/add/page.tsx
import ProductForm from "@/modules/product/component/ProductForm";
import Form from "@/modules/product/form/Form";
import { Suspense } from "react";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: { step?: string; error?: string; success?: string };
}) {
  return (
    <div className="min-h-screen p-8">
      {searchParams.success && (
        <p className="mb-4 text-green-500">{searchParams.success}</p>
      )}
      {searchParams.error && (
        <p className="mb-4 text-red-500">{searchParams.error}</p>
      )}

      <Suspense fallback={<p>Loading form…</p>}>
        <Form />
      </Suspense>
    </div>
  );
}
