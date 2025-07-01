// app/page.tsx

import { TProduct, TReviews } from "@/lib/types";
import { users } from "@clerk/clerk-sdk-node";
import ReviewCard from "@/modules/review/ReviewCard"; // Import the new ReviewCard component

// A helper type for user data from Clerk
// It's good practice to define this in a shared types file if used across multiple components.
type TUser = {
  id: string;
  imageUrl: string;
  firstName: string | null;
};

export default async function Home() {
  let reviews: TReviews[] = [];
  const productsMap = new Map<string, TProduct>();
  const usersMap = new Map<string, TUser>();

  try {
    // 1. Fetch all reviews
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const reviewsData = await res.json();
    reviews = reviewsData.reviews || []; // Ensure reviews is an array

    if (reviews.length === 0) {
      // No reviews to process, exit early
      return (
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="mt-4 text-gray-500">No reviews found yet.</p>
        </div>
      );
    }

    // 2. Collect all unique Product IDs and User IDs from the reviews
    const productIds = new Set<string>();
    const userIds = new Set<string>();
    reviews.forEach((review) => {
      if (review.productId) {
        productIds.add(review.productId.toString());
      }
      if (review.userId) {
        userIds.add(review.userId);
      }
    });

    // 3. Fetch all products and users concurrently for efficiency
    const productFetchPromises = Array.from(productIds).map(
      async (productId) => {
        try {
          const resProduct = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
            { cache: "no-store" },
          );
          if (!resProduct.ok) return null;
          const productData = await resProduct.json();
          return productData.product as TProduct;
        } catch {
          return null;
        }
      },
    );

    const userFetchPromise = users.getUserList({
      userId: Array.from(userIds),
    });

    // Wait for all data fetching to complete
    const [fetchedProducts, fetchedUsers] = await Promise.all([
      Promise.all(productFetchPromises),
      userFetchPromise,
    ]);

    // 4. Populate Maps for easy data lookup in the render step
    fetchedProducts.forEach((product) => {
      if (product) {
        productsMap.set(product._id.toString(), product);
      }
    });

    fetchedUsers.forEach((user) => {
      usersMap.set(user.id, {
        id: user.id,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
      });
    });
  } catch (error) {
    console.error("Failed to fetch data for home page:", error);
  }

  return (
    <div className="flex flex-col items-center px-4 pt-32">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
        {reviews.map((review) => {
          // Find the corresponding product and user for the current review
          const product = productsMap.get(review.productId.toString());
          const user = usersMap.get(review.userId);

          // Do not render a card if the associated product is missing
          if (!product) {
            return null;
          }

          return (
            <ReviewCard
              key={(review as any)._id}
              review={review}
              product={product}
              user={user}
            />
          );
        })}
      </div>
    </div>
  );
}
