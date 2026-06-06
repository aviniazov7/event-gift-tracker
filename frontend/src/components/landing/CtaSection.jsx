import { Badge } from "@/components/ui/badge";
import GoogleSignIn from "../GoogleSignIn.jsx";

// Adapted from 21st.dev "cta-with-rectangle": the centered rectangle with an
// emerald glow, badge, title and action — here the action is the real Google
// sign-in, so clicking it logs the user in.
export default function CtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50 to-card px-6 py-14 text-center shadow-soft dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-1/2 h-[300px] bg-emerald-500/20 blur-3xl dark:bg-emerald-500/15"
        />
        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
          <Badge variant="soft">מתחילים עכשיו</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            היומן הפרטי שלכם מוכן בלחיצה
          </h2>
          <p className="text-base leading-relaxed text-muted">
            התחברו עם חשבון Google והתחילו לעקוב אחרי המתנות שלכם — בלי התקנה,
            בלי טפסים.
          </p>
          <div className="mt-2">
            <GoogleSignIn />
          </div>
        </div>
      </div>
    </section>
  );
}
