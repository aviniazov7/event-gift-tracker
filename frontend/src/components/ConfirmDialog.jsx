import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { TriangleAlert } from "lucide-react";
import Spinner from "./Spinner.jsx";

// Themed, RTL, accessible confirmation dialog for destructive actions. The
// confirm button is rose (destructive); cancel is neutral. `message` carries
// the cascade warning when relevant. Animates in/out (gated by the global
// reduced-motion guard).
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "מחק",
  cancelLabel = "ביטול",
  onConfirm,
  onCancel,
  busy = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onCancel();
      }}
      transition
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-sm rounded-2xl border border-black/5 bg-card p-6 shadow-soft transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 dark:border-white/10"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
              <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-ink">
                {title}
              </DialogTitle>
              {message && <p className="mt-1 text-sm text-muted">{message}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-start gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-400"
            >
              {busy && <Spinner />}
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="focus-ring cursor-pointer rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
            >
              {cancelLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
