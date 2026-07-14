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

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user"
  const confirmation = !isUser ? parseConfirmation(message.content) : null

  if (confirmation) {
    return (
      <div className="self-start rounded-lg border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2.5 font-[family-name:var(--font-mono)] text-xs text-indigo-900">
        <div className="flex items-center justify-between border-b border-dashed border-indigo-200 pb-1.5">
          <span className="font-semibold uppercase tracking-wide">
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
    )
  }

  return (
    <div
      className={
        isUser
          ? "self-end rounded-2xl rounded-br-sm bg-indigo-700 px-3.5 py-2 text-sm text-white"
          : "self-start rounded-2xl rounded-bl-sm bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900"
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
  )
}
