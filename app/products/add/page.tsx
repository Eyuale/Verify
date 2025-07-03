// app/products/add/page.tsx
import Form from "@/modules/product/form/Form";
import { Suspense } from "react";

// Define an interface for your page's searchParams
interface AddProductPageProps {
  searchParams: {
    step?: string;
    error?: string;
    success?: string;
  };
}

export default function AddProductPage({ searchParams }: AddProductPageProps) {
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