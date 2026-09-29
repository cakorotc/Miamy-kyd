import { cn } from "@/lib/utils";

/**
 * Meridian mark: a wireframe globe with a single meridian ellipse.
 * Stroke-based, so it inherits currentColor at any size.
 */
export function MeridianLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
      aria-label="Meridian logo"
    >
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="4" />
      <ellipse cx="24" cy="24" rx="7" ry="16" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}
