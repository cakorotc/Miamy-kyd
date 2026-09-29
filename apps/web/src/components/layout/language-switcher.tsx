import { useI18n, LANGUAGES, NATIVE_LABELS, type Lang } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function useChangeLang(): (l: Lang) => void {
  const { lang, setLang, t } = useI18n();
  const toast = useToast();
  return (l: Lang) => {
    if (l === lang) return;
    setLang(l);
    toast.push("success", t("languageChanged"));
  };
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang } = useI18n();
  const changeLang = useChangeLang();

  return (
    <div className={cn("flex items-center gap-0.5 rounded-full border border-border bg-surface p-1", className)}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          title={NATIVE_LABELS[l.code]}
          onClick={() => changeLang(l.code)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            lang === l.code ? "bg-main text-mtext" : "text-muted hover:bg-surface2 hover:text-text",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
