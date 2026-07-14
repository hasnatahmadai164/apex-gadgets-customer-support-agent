"use client"

import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useChatWidget } from "@/components/chat-widget/ChatWidgetContext"

export function Header() {
  const { setIsOpen } = useChatWidget()

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold tracking-tight text-zinc-950">
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

        <Button
          variant="ghost"
          size="default"
          onClick={() => setIsOpen(true)}
          className="gap-2 text-sm text-zinc-700"
        >
          <MessageCircle className="h-4 w-4" />
          Support
        </Button>
      </div>
    </header>
  )
}
