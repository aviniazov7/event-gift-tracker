import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GoogleSignIn from "../GoogleSignIn.jsx";

// Adapted from 21st.dev "hero-minimalism": same minimalist, centered layout, but
// the full-screen canvas particle field is replaced with a static emerald glow —
// lighter, no continuous animation, and brand-on.
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[420px] w-[680px] max-w-[120vw] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/15" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-16 text-center sm:pt-24">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-soft">
          <Gift className="h-7 w-7 text-white" strokeWidth={2} aria-hidden="true" />
        </span>

        <Badge variant="soft" className="mb-5">
          מתנות שנתת וקיבלת — במקום אחד
        </Badge>

        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
          היומן החכם למתנות באירועים
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          עקבו אחרי כל מתנה שנתתם וקיבלתם, גלו הדדיות מול כל אדם, וקבלו תמונה
          מלאה עם סטטיסטיקות וגרפים — יומן פרטי לחלוטין, עם כניסה מאובטחת דרך
          Google.
        </p>

        <div className="mt-9">
          <GoogleSignIn />
        </div>

        <p className="mt-4 text-xs text-muted">חינמי · פרטי · בעברית מלאה</p>
      </div>
    </section>
  );
}
