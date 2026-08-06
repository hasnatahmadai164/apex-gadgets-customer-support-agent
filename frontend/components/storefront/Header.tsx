"use client"

import { MessageCircle } from "lucide-react"

import { useChatWidget } from "@/components/chat-widget/ChatWidgetContext"

export function Header() {
  const { setIsOpen } = useChatWidget()

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight text-zinc-950">
          Apex Gadgets
        </span>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
          <a href="#phones" className="transition-colors hover:text-zinc-950">
            Phones
          </a>
          <a href="#laptops" className="transition-colors hover:text-zinc-950">
            Laptops
          </a>
        </nav>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(67,56,202,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-2px_rgba(67,56,202,0.45)]"
        >
          <MessageCircle className="h-4 w-4" />
          Support
        </button>
      </div>
    </header>
  )
}
