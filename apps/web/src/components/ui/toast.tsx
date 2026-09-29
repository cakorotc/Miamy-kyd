import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const iconColors: Record<ToastKind, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
};

const borderColors: Record<ToastKind, string> = {
  success: "border-success/40",
  error: "border-danger/40",
  info: "border-info/40",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((kind: ToastKind, message: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 end-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
          {items.map((t) => {
            const Icon = icons[t.kind];
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-start gap-3 rounded-base border bg-surface p-3 shadow-pop animate-pop-in",
                  borderColors[t.kind],
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColors[t.kind])} />
                <span className="flex-1 break-words text-sm font-semibold text-text">
                  {t.message}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted transition-colors hover:text-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
