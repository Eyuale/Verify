import ProductForm from "@/components/form/product_form";
import { Suspense } from "react";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: { step?: string; error?: string; success?: string };
}) {
  return (
    <div>
      {searchParams.success && (
        <p className="text-green-500">{searchParams.success}</p>
      )}
      <Suspense fallback={<p>Loading...</p>}>
        <ProductForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
