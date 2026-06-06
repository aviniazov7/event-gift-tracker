import { useEffect } from "react";
import { Gift } from "lucide-react";
import { prewarm } from "../api/client.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Hero from "../components/landing/Hero.jsx";
import Features from "../components/landing/Features.jsx";
import CtaSection from "../components/landing/CtaSection.jsx";
import Footer from "../components/landing/Footer.jsx";

// Marketing landing shown to logged-out visitors: hero → features → CTA →
// footer. Both sign-in CTAs are the real Google widget. Fully RTL, themed.
export default function LandingPage() {
  // Nudge the free-tier backend awake the moment the page loads, overlapping the
  // cold start with the time the visitor spends reading.
  useEffect(() => {
    prewarm();
  }, []);

  return (
    <div dir="rtl" className="min-h-full overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
            <Gift className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            GiftLedger
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="animate-page">
        <Hero />
        <Features />
        <CtaSection />
        <Footer />
      </main>
    </div>
  );
}
