import * as React from "react";
import { Github, Tag, Star } from "lucide-react";
import { MeridianLogo } from "@/components/meridian-logo";
import { useGitHubStars } from "@/components/github-button";
import { GITHUB_URL, GITHUB_REPO, PANEL_VERSION } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

/**
 * Shell for Setup and Login: split layout with a brand hero panel on the
 * left (desktop) and a frosted form panel on the right. Stacks on mobile.
 */
export function AuthShell({
  children,
  heading,
  sub,
  highlights,
}: {
  children: React.ReactNode;
  heading: string;
  sub: string;
  highlights?: { icon: React.ElementType; text: string }[];
}) {
  const { t } = useI18n();
  const stars = useGitHubStars();

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-40" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-main/15 blur-[110px] animate-[drift1_26s_ease-in-out_infinite]" />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-info/15 blur-[120px] animate-[drift2_32s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-1/3 h-80 w-80 rounded-full bg-success/10 blur-[110px] animate-[drift3_36s_ease-in-out_infinite]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-4 lg:p-8">
        <div className="grid w-full overflow-hidden rounded-card border border-border bg-surface shadow-pop lg:grid-cols-[1.05fr_1fr]">
          {/* Brand / hero panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-surface2 via-surface to-bg p-10 lg:flex">
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(45deg,transparent,transparent_14px,#38bdf8_14px,#38bdf8_15px)]" />
            <div className="relative flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-card border border-main/40 bg-main/15 text-main animate-[float_3s_ease-in-out_infinite]">
                <MeridianLogo className="h-8 w-8" />
              </div>
              <div>
                <div className="font-heading text-4xl leading-none tracking-tight">Meridian</div>
                <div className="mt-1.5 text-sm font-base text-muted">{t("tagline")}</div>
              </div>
            </div>

            <div className="relative space-y-5">
              <h2 className="max-w-[18ch] font-heading text-3xl leading-tight">{heading}</h2>
              <p className="max-w-[36ch] font-base text-muted">{sub}</p>
              {highlights && (
                <ul className="space-y-3 pt-1">
                  {highlights.map((h, i) => (
                    <li
                      key={h.text}
                      className="flex items-center gap-3 animate-slide-up"
                      style={{ animationDelay: `${120 + i * 90}ms` }}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-base border border-main/30 bg-main/10 text-main">
                        <h.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-base text-text/85">{h.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative text-xs font-semibold uppercase tracking-widest text-muted/60">
              © {new Date().getFullYear()} Meridian
            </div>
          </div>

          {/* Form panel */}
          <div className="flex flex-col justify-center gap-6 bg-surface/60 p-6 backdrop-blur-xl sm:p-10">
            <div className="animate-slide-up">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <div className="grid h-12 w-12 place-items-center rounded-card border border-main/40 bg-main/15 text-main">
                  <MeridianLogo className="h-7 w-7" />
                </div>
                <div>
                  <div className="font-heading text-2xl tracking-tight">Meridian</div>
                  <div className="text-xs font-base text-muted">{t("tagline")}</div>
                </div>
              </div>
              <h1 className="font-heading text-3xl tracking-tight">{heading}</h1>
              <p className="mt-1.5 text-sm font-base text-muted">{sub}</p>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "80ms" }}>
              {children}
            </div>

            <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "160ms" }}>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2 rounded-base border border-border bg-surface2/60 px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-main/40 hover:text-main"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Github className="h-4 w-4 shrink-0" />
                    <span className="truncate">{GITHUB_REPO}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-main/30 bg-main/15 px-1.5 text-main">
                    <Star className="h-3 w-3" fill="currentColor" />
                    {stars ?? 0}
                  </span>
                </a>
                <a
                  href={`${GITHUB_URL}/releases`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-base border border-border bg-surface2/60 px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-main/40 hover:text-main"
                >
                  <Tag className="h-4 w-4 shrink-0" />
                  <span className="truncate">v{PANEL_VERSION}</span>
                </a>
              </div>

              <LanguageSwitcher className="w-full justify-between [&>button]:flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullscreenLoader() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-card border border-main/40 bg-main/10 text-main shadow-glow animate-[float_3s_ease-in-out_infinite]">
          <MeridianLogo className="h-9 w-9" />
        </div>
        <div className="text-center">
          <div className="font-heading text-2xl tracking-tight">Meridian</div>
          <div className="mt-1.5 text-sm text-muted">{t("loadingApp")}</div>
        </div>
      </div>
    </div>
  );
}
