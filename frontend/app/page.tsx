import { Footer } from "@/components/storefront/Footer"
import { Header } from "@/components/storefront/Header"
import { Hero } from "@/components/storefront/Hero"
import { ProductGrid } from "@/components/storefront/ProductGrid"

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
    </>
  )
}
