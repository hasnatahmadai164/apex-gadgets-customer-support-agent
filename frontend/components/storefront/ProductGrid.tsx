import { featuredProducts } from "@/lib/products"
import { ProductCard } from "./ProductCard"

export function ProductGrid() {
  const phones = featuredProducts.filter((product) => product.category === "phone")
  const laptops = featuredProducts.filter((product) => product.category === "laptop")

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section id="phones">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-zinc-950">
          Phones
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {phones.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="laptops" className="mt-16">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-zinc-950">
          Laptops
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {laptops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
