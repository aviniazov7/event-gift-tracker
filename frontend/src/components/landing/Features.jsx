import {
  ArrowRightLeft,
  BarChart3,
  KeyRound,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Adapted from 21st.dev "feature-section-with-grid": same badge + heading +
// responsive card grid, filled with GiftLedger's real value props (RTL, Hebrew).
const FEATURES = [
  {
    icon: Zap,
    title: "הוספה מהירה",
    desc: "רישום מתנה בטופס אחד — בחירת אירוע ואדם והסכום, בפעולה אחת.",
  },
  {
    icon: ArrowRightLeft,
    title: "נתת מול קיבלת",
    desc: "כל תנועה מסומנת בכיוון, כך שתמיד ברור מה נתתם ומה קיבלתם.",
  },
  {
    icon: Scale,
    title: "הדדיות לכל אדם",
    desc: "מאזן נתת/קיבלת מול כל אדם — כדי שלא תאבדו את החשבון.",
  },
  {
    icon: BarChart3,
    title: "סטטיסטיקות וגרפים",
    desc: "סכומים, ממוצעים, פילוח לפי סוג אירוע והאנשים המובילים.",
  },
  {
    icon: ShieldCheck,
    title: "פרטי לחלוטין",
    desc: "כל משתמש רואה רק את הנתונים שלו — בידוד מלא לכל חשבון.",
  },
  {
    icon: KeyRound,
    title: "כניסה עם Google",
    desc: "התחברות מאובטחת בלחיצה אחת, בלי סיסמאות לזכור.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="flex flex-col gap-3">
        <div>
          <Badge variant="soft">למה GiftLedger</Badge>
        </div>
        <h2 className="max-w-xl text-start text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          כל מה שצריך כדי לנהל מתנות באירועים
        </h2>
        <p className="max-w-xl text-start text-base leading-relaxed text-muted">
          מאירוע בודד ועד שנים של חתונות, בריתות וימי הולדת — הכול מסודר במקום
          אחד.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-black/5 bg-card p-6 shadow-soft transition duration-200 hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:hover:border-emerald-500/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-start text-lg font-semibold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-1.5 text-start text-sm leading-relaxed text-muted">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
