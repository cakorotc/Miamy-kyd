import * as React from "react";
import { LogOut, Crown, Github, Tag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useGitHubStars } from "@/components/github-button";
import { GITHUB_URL, PANEL_VERSION } from "@/lib/brand";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { username, logout, admin } = useAuth();
  const { t } = useI18n();
  const stars = useGitHubStars();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-base border border-transparent px-1.5 py-1.5 transition-colors hover:border-border hover:bg-surface"
      >
        <span className="hidden text-sm font-semibold sm:block">{username}</span>
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full border text-sm font-bold",
            admin?.role === "owner"
              ? "border-warning/40 bg-warning/15 text-warning"
              : "border-main/40 bg-main/15 text-main",
          )}
        >
          {admin?.role === "owner" ? (
            <Crown className="h-4 w-4" />
          ) : (
            (username || "A").slice(0, 1).toUpperCase()
          )}
        </div>
      </button>

      {open && (
        <div className="absolute end-0 top-12 z-40 w-60 rounded-base border border-border bg-surface p-2 shadow-pop animate-pop-in">
          <div className="border-b border-border/70 px-2 pb-2">
            <div className="truncate text-sm font-semibold">{username || "admin"}</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {admin?.role === "owner" ? t("owner") : t("admin")}
            </div>
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center justify-between gap-2 rounded-[7px] px-2 py-2 text-sm font-base text-text transition-colors hover:bg-surface2"
          >
            <span className="flex items-center gap-2">
              <Github className="h-4 w-4 text-muted" />
              GitHub
            </span>
            {stars !== null && (
              <span className="rounded-full border border-main/30 bg-main/15 px-1.5 text-xs font-semibold text-main">
                {stars}
              </span>
            )}
          </a>

          <a
            href={`${GITHUB_URL}/releases`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-2 rounded-[7px] px-2 py-2 text-sm font-base text-text transition-colors hover:bg-surface2"
          >
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted" />
              {t("version")}
            </span>
            <span className="text-xs font-semibold text-muted">v{PANEL_VERSION}</span>
          </a>

          <div className="border-t border-border/70 px-2 pb-1 pt-2">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t("language")}
            </div>
            <LanguageSwitcher className="w-full justify-between [&>button]:flex-1" />
          </div>

          <button
            onClick={() => void logout()}
            className="mt-1 flex w-full items-center gap-2 rounded-[7px] px-2 py-2 text-start text-sm font-base text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
