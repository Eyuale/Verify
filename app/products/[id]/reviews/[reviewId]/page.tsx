import { TProduct, TReviews } from "@/lib/types";
import ProductVideoFeed from "@/modules/product/component/ProductVideoFeed";

const VideoReviewPage = async ({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) => {
  const { reviewId } = await params;
  const Response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`,
  );
  const { product, review }: { product: TProduct; review: TReviews } =
    await Response.json();

  // Check if the review and its videoUrl exist
  if (!review || !review.videoUrl || review.videoUrl.length === 0) {
    return <div className="p-4 text-red-500">Review video not found.</div>;
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-2 pt-12">
      {/* Left: scrollable feed */}
      <div className="h-full w-full pl-2">
        <ProductVideoFeed
          videoUrls={
            Array.isArray(review.videoUrl) ? review.videoUrl : [review.videoUrl]
          }
          posterUrl={product.imageUrl}
        />
      </div>

      <div className="mt-6 space-y-4">
        <h1 className="text-2xl font-semibold">{product.product_name}</h1>
        <p className="text-gray-700">{product.description}</p>
        <p className="text-blue-600">Price: ${product.price}</p>
        {product.company_name && (
          <p className="text-sm text-gray-500">
            Sold by {product.company_name}
          </p>
        )}
        {/* You can also display review-specific details here */}
        <div className="mt-4 border-t pt-4">
          <h2 className="text-xl font-semibold">Review Details</h2>
          <p>Rating: {review.rating}/5</p>
          <p>{review.reviewDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoReviewPage;
