"use client"

import { motion } from "framer-motion"
import { PackageCheck, Sparkles } from "lucide-react"

export type ChatMessageData = {
  id: string
  role: "user" | "assistant"
  content: string
}

function parseConfirmation(content: string) {
  const orderMatch = content.match(/^Order #(\d+) placed for (.+?), status: (\w+)\.\s*(.*)$/)
  if (orderMatch) {
    return {
      kind: "order" as const,
      id: `#${orderMatch[1]}`,
      detail: orderMatch[2],
      status: orderMatch[3],
      note: orderMatch[4],
    }
  }

  const ticketMatch = content.match(/^Support ticket (TKT-\w+) created, status: (\w+)\.\s*(.*)$/)
  if (ticketMatch) {
    return {
      kind: "ticket" as const,
      id: ticketMatch[1],
      detail: undefined,
      status: ticketMatch[2],
      note: ticketMatch[3],
    }
  }

  return null
}

function AssistantAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-sm">
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  )
}

function MessageLabel({ isUser }: { isUser: boolean }) {
  return (
    <span
      className={
        isUser
          ? "pr-1 text-[11px] font-bold text-zinc-500"
          : "pl-9 text-[11px] font-bold text-zinc-500"
      }
    >
      {isUser ? "You" : "Apex Gadgets"}
    </span>
  )
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user"
  const confirmation = !isUser ? parseConfirmation(message.content) : null

  if (confirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-start gap-1"
      >
        <MessageLabel isUser={false} />
        <div className="flex items-start gap-2">
          <AssistantAvatar />
          <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2.5 font-[family-name:var(--font-mono)] text-xs text-indigo-900 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-dashed border-indigo-200 pb-1.5">
              <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                <PackageCheck className="h-3.5 w-3.5" />
                {confirmation.kind === "order" ? "Order Confirmed" : "Ticket Filed"}
              </span>
              <span>{confirmation.id}</span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              {confirmation.detail && <div>{confirmation.detail}</div>}
              <div className="text-indigo-600">status: {confirmation.status}</div>
            </div>
            {confirmation.note && (
              <div className="mt-1.5 text-[11px] text-indigo-700">{confirmation.note}</div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={isUser ? "flex flex-col items-end gap-1" : "flex flex-col items-start gap-1"}
    >
      <MessageLabel isUser={isUser} />
      <div className={isUser ? "flex justify-end" : "flex items-start gap-2"}>
        {!isUser && <AssistantAvatar />}
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-600 to-indigo-700 px-3.5 py-2 text-sm text-white shadow-sm"
              : "rounded-2xl rounded-bl-sm bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900 shadow-sm"
          }
        >
          {message.content ? (
            message.content
          ) : (
            <span className="inline-flex items-center gap-1 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
