"use client"
import { useToast } from "./use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn("rounded-lg border bg-card p-4 shadow-hover animate-fade-in")}>
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
          <button className="mt-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => dismiss(t.id)}>Close</button>
        </div>
      ))}
    </div>
  )
}
