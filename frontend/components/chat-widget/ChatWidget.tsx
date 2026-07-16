"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, type ChatMessageData } from "./ChatMessage"
import { useChatWidget } from "./ChatWidgetContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const GREETING: ChatMessageData = {
  id: "greeting",
  role: "assistant",
  content: "Hello! How can I assist you today?",
}

const STARTER_PROMPTS = [
  "What's your return policy?",
  "Track my order",
  "I want to place an order",
  "Report an issue",
]

export function ChatWidget() {
  const { isOpen, setIsOpen, pendingMessage, clearPendingMessage } = useChatWidget()
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  function getViewport() {
    return scrollContainerRef.current?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]"
    )
  }

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const viewport = getViewport()
    if (!viewport) return

    function handleScroll() {
      const el = viewport
      if (!el) return
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      shouldAutoScrollRef.current = distanceFromBottom < 80
    }

    viewport.addEventListener("scroll", handleScroll)
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (pendingMessage) {
      const message = pendingMessage
      clearPendingMessage()
      sendMessage(message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage])

  async function clearChat() {
    try {
      await fetch(`${API_URL}/chat/clear`, {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // even if the network call fails, still reset the local conversation
    }
    setMessages([])
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || isStreaming) return

    const userMessage: ChatMessageData = { id: crypto.randomUUID(), role: "user", content: text }
    const assistantId = crypto.randomUUID()

    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "" }])
    if (!overrideText) setInput("")
    setIsStreaming(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          const line = event.trim()
          if (!line.startsWith("data:")) continue

          const payload = line.slice(5).trim()
          if (payload === "[DONE]") continue

          try {
            const { content } = JSON.parse(payload) as { content: string }
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + content }
                  : message
              )
            )
          } catch {
            continue
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: "Something went wrong. Please try again." }
            : message
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 flex h-[32rem] w-96 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold tracking-tight">
                    Apex Gadgets Support
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-indigo-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    </span>
                    Online now
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="rounded-md p-1 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={scrollContainerRef} className="min-h-0 flex-1">
              <ScrollArea className="h-full px-4 py-4">
                <div className="flex flex-col gap-3">
                  {messages.length === 0 ? (
                    <>
                      <ChatMessage message={GREETING} />
                      <div className="flex flex-wrap gap-2 pl-9">
                        {STARTER_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    messages.map((message) => <ChatMessage key={message.id} message={message} />)
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage()
              }}
              className="flex items-center gap-2 border-t border-zinc-100 p-3"
            >
              <div className="flex flex-1 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-4 pr-1.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type your message..."
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  aria-label="Send message"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            <p className="pb-2.5 text-center text-[11px] font-bold text-zinc-500">
              Powered by Apex Gadgets
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg"
      >
        {!isOpen && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-indigo-500 opacity-40" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
