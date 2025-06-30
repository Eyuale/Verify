import ProductCard from "@/modules/product/ProductCard"

const page = async ({
  params
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params

  const Response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
  const { product } = await Response.json()



  console.log(product)

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
      /> */}
    </div>
  )
}

export default page