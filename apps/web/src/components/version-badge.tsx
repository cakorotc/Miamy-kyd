import { Tag } from "lucide-react";
import { GITHUB_URL, PANEL_VERSION } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function VersionBadge({ className }: { className?: string }) {
  return (
    <a
      href={`${GITHUB_URL}/releases`}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-base border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:border-main/40 hover:text-main",
        className,
      )}
    >
      <Tag className="h-4 w-4" />
      <span>v{PANEL_VERSION}</span>
    </a>
  );
}
