import { useState } from "react";

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const data = {
      title: "GiftLedger",
      text: "אפליקציה לניהול מתנות שנתתי וקיבלתי",
      url: window.location.origin,
    };

    // Native share sheet on mobile / supported browsers.
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* user dismissed the share sheet */
      }
      return;
    }

    // Desktop fallback: copy the URL and confirm inline.
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        aria-label="שיתוף"
        title="שיתוף"
        className="focus-ring cursor-pointer rounded-xl p-2.5 text-muted transition-colors duration-200 hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
      >
        <ShareIcon />
      </button>

      {copied && (
        <span className="absolute left-1/2 top-full z-30 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow dark:bg-emerald-500">
          הקישור הועתק
        </span>
      )}
    </div>
  );
}
