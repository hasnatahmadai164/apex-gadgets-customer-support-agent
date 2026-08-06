"use client"

import { Laptop, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useChatWidget } from "@/components/chat-widget/ChatWidgetContext"
import type { Product } from "@/lib/products"

function formatPrice(cents: number) {
  return `$${cents.toLocaleString()}`
}

export function ProductCard({ product }: { product: Product }) {
  const { openWithMessage } = useChatWidget()
  const Icon = product.category === "phone" ? Smartphone : Laptop
  const discountedPrice = product.discountPercent
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : null

  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_1px_3px_rgba(24,24,27,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-zinc-200 hover:shadow-[0_16px_32px_-8px_rgba(24,24,27,0.12)]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700">
          <Icon className="h-5 w-5" />
        </div>
        {product.discountPercent && (
          <span className="rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 px-2.5 py-1 text-xs font-bold text-cyan-800">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <h3 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-zinc-950">
        {product.name}
      </h3>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-zinc-500">
        {product.specs}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        {discountedPrice ? (
          <>
            <span className="text-lg font-bold text-zinc-950">
              {formatPrice(discountedPrice)}
            </span>
            <span className="text-sm text-zinc-400 line-through">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="text-lg font-bold text-zinc-950">{formatPrice(product.price)}</span>
        )}
      </div>

      <Button
        variant="ghost"
        className="mt-4 justify-start px-0 text-sm font-medium text-indigo-700 hover:bg-transparent hover:text-indigo-800"
        onClick={() => openWithMessage(`I'd like to order the ${product.name}`)}
      >
        Ask about ordering →
      </Button>
    </div>
  )
}
