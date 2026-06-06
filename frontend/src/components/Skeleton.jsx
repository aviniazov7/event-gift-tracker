// A single shimmering placeholder block. Compose several to mirror real layout.
export default function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />;
}
