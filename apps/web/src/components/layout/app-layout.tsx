import * as React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Router,
  Ban,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  Github,
  Crown,
  Bot,
  Tag,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { GitHubButton, useGitHubStars } from "@/components/github-button";
import { VersionBadge } from "@/components/version-badge";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Button } from "@/components/ui/button";
import { MeridianLogo } from "@/components/meridian-logo";
import { AnimatedBackground } from "@/components/animated-background";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";
import { GITHUB_URL, PANEL_VERSION } from "@/lib/brand";
import type { Permission } from "@/lib/types";

const nav: {
  to: string;
  labelKey: TKey;
  icon: typeof LayoutDashboard;
  end: boolean;
  perm: Permission;
}[] = [
  { to: "/", labelKey: "dashboard", icon: LayoutDashboard, end: true, perm: "dashboard" },
  { to: "/users", labelKey: "users", icon: Users, end: false, perm: "users" },
  { to: "/inbounds", labelKey: "inbounds", icon: Router, end: false, perm: "inbounds" },
  { to: "/routing", labelKey: "routing", icon: Ban, end: false, perm: "routing" },
  { to: "/activity", labelKey: "activityLog", icon: ScrollText, end: false, perm: "activity" },
  { to: "/bot", labelKey: "telegramBot", icon: Bot, end: false, perm: "bot" },
  { to: "/settings", labelKey: "settings", icon: Settings, end: false, perm: "settings" },
];

function Brand() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-base border border-main/40 bg-main/15 text-main">
        <MeridianLogo className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="font-heading text-base tracking-tight">Meridian</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          {t("tagline")}
        </div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  const { t } = useI18n();
  return (
    <nav className="flex flex-col gap-1">
      {nav
        .filter((item) => can(item.perm))
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-base px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-main/10 text-main"
                  : "text-muted hover:bg-surface2/60 hover:text-text",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105" />
            {t(item.labelKey)}
          </NavLink>
        ))}
    </nav>
  );
}

function StarCount() {
  const stars = useGitHubStars();
  return (
    <span className="flex items-center gap-1 rounded-full border border-main/30 bg-main/15 px-1.5 text-xs font-semibold text-main">
      {stars ?? 0}
    </span>
  );
}

function SidebarFooter({
  onLogout,
}: {
  onLogout: () => Promise<void>;
}) {
  const { username, admin } = useAuth();
  const { t } = useI18n();
  return (
    <div className="rounded-base border border-border bg-surface/70 p-3">
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold",
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
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{username || "admin"}</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {admin?.role === "owner" ? t("owner") : t("admin")}
          </div>
        </div>
      </div>
      <Button
        variant="neutral"
        size="sm"
        className="w-full"
        onClick={() => void onLogout()}
      >
        <LogOut className="h-4 w-4" />
        {t("signOut")}
      </Button>
    </div>
  );
}

function SidebarLinks() {
  const { t } = useI18n();
  return (
    <div className="space-y-1">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 rounded-base border border-border bg-surface/70 px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-main"
      >
        <span className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          GitHub
        </span>
        <StarCount />
      </a>
      <a
        href={`${GITHUB_URL}/releases`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 rounded-base border border-border bg-surface/70 px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-main"
      >
        <span className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          {t("version")}
        </span>
        <span className="text-xs font-semibold text-muted/80">v{PANEL_VERSION}</span>
      </a>
    </div>
  );
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { logout } = useAuth();
  return (
    <>
      <div className="px-2 py-1">
        <Brand />
      </div>
      <div className="mt-5 flex-1 overflow-y-auto no-scrollbar">
        <NavItems onNavigate={onNavigate} />
      </div>
      <div className="mt-4 space-y-3">
        <SidebarLinks />
        <LanguageSwitcher className="w-full justify-between [&>button]:flex-1" />
        <SidebarFooter onLogout={logout} />
      </div>
    </>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-bg/60 p-4 backdrop-blur lg:flex">
          <SidebarContent />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="neutral"
                size="icon"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Brand />
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <GitHubButton showStars={false} />
              <VersionBadge />
            </div>
            <UserMenu />
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <div className="mx-auto max-w-7xl animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>

        <WelcomeDialog />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute start-0 top-0 flex h-full w-72 flex-col border-e border-border bg-bg p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="neutral" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 flex flex-1 flex-col overflow-hidden">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
