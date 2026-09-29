import * as React from "react";
import { Heart, Star, Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MeridianLogo } from "@/components/meridian-logo";
import { useGitHubStars } from "@/components/github-button";
import { useI18n } from "@/lib/i18n";
import { GITHUB_URL } from "@/lib/brand";

const STORAGE_KEY = "mrd_welcome_seen_session";

export function WelcomeDialog() {
  const [open, setOpen] = React.useState(false);
  const stars = useGitHubStars();
  const { t } = useI18n();

  React.useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) !== "1") {
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? close() : setOpen(o))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-card border border-main/40 bg-main/10 text-main shadow-glow animate-[float_3s_ease-in-out_infinite]">
            <MeridianLogo className="h-9 w-9" />
          </div>
          <DialogTitle className="text-center text-2xl">{t("welcomeTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-sm font-base text-muted">{t("welcomeDesc")}</p>

          <div className="flex items-start gap-3 rounded-base border border-main/25 bg-main/10 p-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-main" fill="currentColor" />
            <p className="text-sm font-base text-text/85">
              {t("welcomeStar")} <span className="font-semibold">{t("star")}</span>{" "}
              {t("welcomeStarEnd")}
            </p>
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="flex items-center justify-between gap-2 rounded-base border border-border bg-surface2/60 px-3 py-2.5 text-sm font-semibold text-text transition-colors hover:border-main/40 hover:text-main"
          >
            <span className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              {t("starOnGithub")}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-main/30 bg-main/15 px-1.5 text-xs font-semibold text-main">
              <Star className="h-3 w-3" fill="currentColor" />
              {stars ?? 0}
            </span>
          </a>

          <Button variant="neutral" className="w-full" onClick={close}>
            {t("maybeLater")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
