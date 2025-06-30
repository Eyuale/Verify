// app/page.tsx

import { TReviews } from "@/lib/types";
import Link from "next/link";

export default async function Home() {
  let review: TReviews[] = [];
  const productsMap = new Map<string, TProduct>(); // To store products by their ID
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const reviews = await res.json();

    review = await reviews.reviews;

    const productIds = new Set<string>();
    reviews.forEach((review) => {
      if (review.productId) {
        productIds.add(review.productId);
      }
    });

    // 3. Fetch details for each unique product ID
    // We'll use Promise.all to fetch all products concurrently
    const productFetchPromises = Array.from(productIds).map(
      async (productId) => {
        try {
          const resProduct = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
            {
              cache: "no-store",
            },
          );

          if (!resProduct.ok) {
            console.warn(
              `Could not fetch product with ID: ${productId}. Status: ${resProduct.status}`,
            );
            return null; // Return null if product fetch fails
          }
          const productData = await resProduct.json();
          return productData.product as TProduct; // Assuming the product data is under 'product' key
        } catch (productError) {
          console.error(`Error fetching product ${productId}:`, productError);
          return null; // Return null on error
        }
      },
    );

    // Wait for all product fetches to complete
    const fetchedProducts = await Promise.all(productFetchPromises);

    // Populate the productsMap for easy lookup
    fetchedProducts.forEach((product) => {
      if (product) {
        productsMap.set(product._id, product);
      }
    });
  } catch (error) {
    console.log(error);
  }

  return (
    <div className="pt-32">
      <h1>Welcome</h1>
      <div className="flex flex-row gap-2">
        {review.map(async (review, index) => {
          return (
            <Link
              href={`/products/${review.productId}/reviews/${review._id}`}
              key={index}
            >
              <video
                src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${review.videoUrl}`}
                controls
                width={100}
                height={200}
              />
              <div>
                {/* <img src={} />
                <p>{}</p> */}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
