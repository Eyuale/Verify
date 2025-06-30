// import ProductVideoFeed from "@/modules/product/component/ProductVideoFeed";
import Button from "@/shared/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Page = async ({
  params
}: {
  params: Promise<{ reviewId: string }>
}) => {

    const { reviewId } = await params;
    const Response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`)
    const Review = await Response.json()    

  return (
<div className="grid min-h-screen w-full grid-cols-2 pt-12">
      {/* Left: scrollable feed */}
      {/* <div className="h-full w-full pl-2">
        <ProductVideoFeed videoUrls={Review.videoUrl} />
      </div> */}

      {/* Right: product details */}
      <div className="flex-1 overflow-y-auto p-8">
        <Link href="/">
          <Button
            type="button"
            label="Back"
            icon={<ArrowLeft size={16} className="mr-2" />}
            className="bg-blue-50/70 pr-6 text-blue-600"
          />
        </Link>

        {/* <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-semibold">{product.product_name}</h1>
          <p className="text-gray-700">{product.description}</p>
          <p className="text-blue-600">Price: ${product.price}</p>
          {product.company_name && (
            <p className="text-sm text-gray-500">
              Sold by {product.company_name}
            </p>
          )}
        </div> */}
      </div>
    </div>

  )
};

export default Page;
