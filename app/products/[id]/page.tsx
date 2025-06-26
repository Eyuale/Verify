import { connectToDatabase } from "@/utils/db";
import { Product } from "@/models/productSchema";
import { T_PRODUCT_DOCUMENT } from "@/components/product/types/data";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string }; // <-- Change this line
}) {
  console.log("Attempting to connect to database...");
  await connectToDatabase();
  console.log("Database connection attempt finished.");

  try {
    const productId = params.id;
    console.log("Fetching product with ID:", productId);

    const product: T_PRODUCT_DOCUMENT | null = (await Product.findById(
      productId
    ).lean()) as T_PRODUCT_DOCUMENT | null;

    console.log("Fetched product data:", product);

    if (!product) {
      console.log("Product not found for ID:", productId);
      return <div>Product not found for ID: {productId}</div>;
    }

    return (
      <div className="w-full flex flex-col">
        <div className="pt-24 grid grid-cols-3">
          <div className="w-full p-4">
            <img
              src={product.imageUrl}
              alt={product.product_name}
              style={{ maxWidth: "300px" }}
            />
          </div>
          <div className="w-full space-y-2 col-span-2 pt-4 px-8">
            {/* Content Spec */}
            <h1 className="capitalize text-2xl tracking-tight">
              {product.product_name}
            </h1>
            <p className="opacity-90 text-sm max-w-[500px]">
              {product.description}
            </p>
            <p className="text-blue-600">Price: ${product.price}</p>
            <p className="text-sm opacity-80 ">
              Sold by <br />
              {product.company_name} INC.
            </p>
            {/* Comments and AI Summary */}
            <div className="w-full rounded-lg bg-black/5 p-4 min-h-56 mt-8"></div>
          </div>
          {/* Add more product details as needed */}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return <div>Error loading product: {(error as Error).message}</div>; // Show error message
  }
}
