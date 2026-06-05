import { Switch } from "@headlessui/react";

// Small themed on/off switch (RTL-aware: the knob rests on the right when off
// and slides left when on). `checked` + `onChange(next)` like a controlled input.
export default function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onChange={onChange}
        className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-black/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 data-[checked]:bg-emerald-600 dark:bg-white/20 dark:data-[checked]:bg-emerald-500"
      >
        <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white shadow transition group-data-[checked]:translate-x-1" />
      </Switch>
      {label && (
        <span className="text-xs font-medium text-muted">{label}</span>
      )}
    </div>
  );
}
