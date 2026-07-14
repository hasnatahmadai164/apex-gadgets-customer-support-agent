export type Product = {
  id: string
  name: string
  category: "phone" | "laptop"
  price: number
  discountPercent?: number
  specs: string
}

export const featuredProducts: Product[] = [
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "phone",
    price: 649,
    discountPercent: 10,
    specs: "128/256GB · 12GB RAM · 48MP",
  },
  {
    id: "galaxy-s25-ultra",
    name: "Galaxy S25 Ultra",
    category: "phone",
    price: 799,
    discountPercent: 10,
    specs: "128/256GB · 12GB RAM · 48MP",
  },
  {
    id: "galaxy-z-fold7",
    name: "Galaxy Z Fold7",
    category: "phone",
    price: 949,
    specs: "128/256GB · 12GB RAM · 48MP",
  },
  {
    id: "pixel-10",
    name: "Pixel 10",
    category: "phone",
    price: 1199,
    discountPercent: 10,
    specs: "128/256GB · 12GB RAM · 48MP",
  },
  {
    id: "macbook-air-m3",
    name: "MacBook Air M3",
    category: "laptop",
    price: 999,
    specs: "16-64GB RAM · 512GB-2TB SSD",
  },
  {
    id: "macbook-air-13-m4",
    name: "MacBook Air 13 M4",
    category: "laptop",
    price: 1099,
    specs: "16-64GB RAM · 512GB-2TB SSD",
  },
  {
    id: "macbook-pro-14-m4",
    name: "MacBook Pro 14 M4",
    category: "laptop",
    price: 1999,
    discountPercent: 20,
    specs: "16-64GB RAM · 512GB-2TB SSD",
  },
  {
    id: "macbook-pro-16-m4-max",
    name: "MacBook Pro 16 M4 Max",
    category: "laptop",
    price: 3499,
    discountPercent: 20,
    specs: "16-64GB RAM · 512GB-2TB SSD",
  },
]
