import { Switch } from "@headlessui/react";

// Small themed on/off switch. The track is a fixed-size pill and the knob is a
// circle positioned INSIDE it via the logical `inset-inline-start` property, so
// it slides between the two ends without ever crossing the edges — and it flips
// correctly in RTL (off rests at the start edge, on slides to the far edge).
// Track 44×24px, knob 20px, 2px inset → 22px of travel, 2px clearance per side.
// `checked` + `onChange(next)` behave like a controlled input.
export default function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onChange={onChange}
        className="group relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full bg-black/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 data-[checked]:bg-emerald-600 dark:bg-white/20 dark:data-[checked]:bg-emerald-500"
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ease-in-out start-0.5 group-data-[checked]:start-[22px]"
        />
      </Switch>
      {label && (
        <span className="text-xs font-medium text-muted">{label}</span>
      )}
    </div>
  );
}
