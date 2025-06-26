// data
import ProductForm from "@/components/form/form";
import { products } from "@/components/product/data/data";
import ProductCard from "@/components/product/product";

export default function Home() {
  return (
    <div className="w-full min-h-screen pb-8 pl-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 min-h-screen">
        <div className="w-full h-full col-span-2">
          <h1 className="text-8xl leading-[90%] tracking-tighter mt-20 font-medium">
            <span className="text-blue-600">Trusted</span> Video <br />
            Product Reviews
          </h1>
          <p className="mt-4 font-normal text-black/60 ml-2 max-w-1/2">
            Your go to site for sellers & consumers helping each other make
            better purchasing decisions.
          </p>
        </div>

        <div></div>
      </div>

      {/* Product lists */}
      <div className="w-full h-auto grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            product_name={product.product_name}
            description={product.description}
            imageUrl={product.imageUrl}
            price={product.price}
            company_name={product.company_name || ""}
          />
        ))}
      </div>

      {/* form */}
      {/* <ProductForm /> */}
    </div>
  );
}
