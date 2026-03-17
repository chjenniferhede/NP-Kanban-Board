import { createPortal } from "react-dom";
import { atom, useAtom } from "jotai";

type Toast = { id: number; message: string; type: "error" | "success" | "info" };

export const toastsAtom = atom<Toast[]>([]);

let nextId = 0;

export function useToast() {
  const [, setToasts] = useAtom(toastsAtom);

  return function toast(message: string, type: Toast["type"] = "error") {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
}

const TYPE_CLASS: Record<Toast["type"], string> = {
  error:   "alert-error",
  success: "alert-success",
  info:    "alert-info",
};

export function Toaster() {
  const [toasts] = useAtom(toastsAtom);
  if (!toasts.length) return null;
  return createPortal(
    <div className="toast toast-top toast-center" style={{ zIndex: 9999 }}>
      {toasts.map((t) => (
        <div key={t.id} className={`alert ${TYPE_CLASS[t.type]}`}>
          <span>{t.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
