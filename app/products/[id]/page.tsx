import Link from "next/link"

type TReview = {
  userId: string,
  rating: number,
  description: string,
  videoUrl: string,
  _id: string,
  createdAt: string,
}

const page = async ({
  params
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params

  const Response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
  const { product, reviews } = await Response.json();


  console.log(product, reviews)

  return (
    <div className="p-32">

      <span>{product.product_name}</span>
      <img src={product.imageUrl} className="w-24 h-24 object-contain" />
      
      {/* <ProductCard 
        id={product._id}
        description={product.description}
        imageUrl={product.imageUrl}
        price={product.price}
        product_name={product.product_name}
        company_name={product.company_name}
        averageRating={1}
        reviewCount={13}
        key={product._id}
        videoUrls={reviews.videoUrl}
      /> */}
      {reviews.map((review: TReview, index: number) => {
        return (
          <Link href={`/products/${product._id}/reviews/${review._id}`} key={index}>
            <div>
              <video src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${review.videoUrl}`} controls />
              <p>{review.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default page