"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, type ChatMessageData } from "./ChatMessage"
import { useChatWidget } from "./ChatWidgetContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export function ChatWidget() {
  const { isOpen, setIsOpen, pendingMessage, clearPendingMessage } = useChatWidget()
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (pendingMessage) {
      const message = pendingMessage
      clearPendingMessage()
      sendMessage(message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage])

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
      {isOpen && (
        <div className="mb-4 flex h-[32rem] w-96 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-950 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-tight">
                Apex Gadgets Support
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Ask about products, orders, or support, we&apos;re here to help.
                </p>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
            className="flex items-center gap-2 border-t border-zinc-100 p-3"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
            />
            <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-lg"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
