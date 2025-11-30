"use client"
import { createContext, useContext, useCallback, useState } from "react"

type Toast = { id: number; title?: string; description?: string }
type ToastContextValue = { toasts: Toast[]; toast: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts(prev => [...prev, { id, ...t }])
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id))
    }, 3000)
  }, [])
  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(x => x.id !== id)), [])
  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("ToastProvider missing")
  return ctx
}
