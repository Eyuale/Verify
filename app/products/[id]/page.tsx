import { TProduct, TReviews } from "@/lib/types";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
  );
  const { product, reviews }: { product: TProduct; reviews: TReviews[] } =
    await Response.json();

  console.log(product, reviews);

  // Calculate review count
  const reviewCount = reviews.length;

  // Calculate average rating
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

  return (
    <div className="min-h-screen w-full space-y-8 px-8 py-32">
      <div className="flex items-start gap-4">
        {/* img */}
        <div className="flex h-72 w-72 items-center justify-center overflow-hidden rounded-md bg-black/5 p-2 dark:bg-white/5">
          <img
            src={product.imageUrl}
            className="h-full w-full rounded-sm object-cover"
            alt={product.product_name}
          />
        </div>
        {/* content */}
        <div className="flex flex-col gap-2">
          <span className="rounded-md bg-black/5 p-2 px-4 opacity-80 dark:bg-white/5">
            Made by {product.company_name}
          </span>
          <h1 className="pt-4 text-3xl tracking-tight capitalize">
            {product.product_name}
          </h1>
          <span className="flex items-center gap-1 text-sm">
            <span className="opacity-70">{averageRating.toFixed(1)}</span>
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                size="xs"
                className={
                  i < Math.round(averageRating)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="opacity-70">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </span>
          <p className="opacity-70">{product.description}</p>
          <p className="text-lg font-medium">Price: ${product.price}</p>
        </div>
      </div>
      <span className="text-sm opacity-70">Video Reviews</span>
      <div className="mt-2 grid w-full grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {reviews.map((review: TReviews, index: number) => {
          // Assuming TReviews has an _id property
          const reviewId = (review as TReviews)._id;
          return (
            <Link
              href={`/products/${product._id}/reviews/${reviewId}`}
              key={index}
            >
              <div className="h-80 w-full overflow-hidden rounded-lg">
                <video
                  src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${review.videoUrl}`}
                  className="h-full w-full object-cover"
                  preload="metadata"
                />
                <p>{review.reviewDescription}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default page;
