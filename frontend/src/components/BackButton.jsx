// Back navigation. In RTL the chevron points right (the "back" direction).
export default function BackButton({ onClick, label = "חזרה" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
      {label}
    </button>
  );
}
