"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ChatWidgetContextValue = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pendingMessage: string | null
  openWithMessage: (message: string) => void
  clearPendingMessage: () => void
}

const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(null)

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  function openWithMessage(message: string) {
    setPendingMessage(message)
    setIsOpen(true)
  }

  function clearPendingMessage() {
    setPendingMessage(null)
  }

  return (
    <ChatWidgetContext.Provider
      value={{ isOpen, setIsOpen, pendingMessage, openWithMessage, clearPendingMessage }}
    >
      {children}
    </ChatWidgetContext.Provider>
  )
}

export function useChatWidget() {
  const context = useContext(ChatWidgetContext)
  if (!context) {
    throw new Error("useChatWidget must be used within a ChatWidgetProvider")
  }
  return context
}
