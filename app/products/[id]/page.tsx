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
      <div className="pt-24">
        <h1>{product.product_name}</h1>
        <p>Description: {product.description}</p>
        <p>Price: ${product.price}</p>
        <p>Company: {product.company_name}</p>
        <img
          src={product.imageUrl}
          alt={product.product_name}
          style={{ maxWidth: "300px" }}
        />
        {/* Add more product details as needed */}
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return <div>Error loading product: {(error as Error).message}</div>; // Show error message
  }
}
