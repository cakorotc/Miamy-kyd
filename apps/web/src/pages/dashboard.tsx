import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Layers,
  Download,
  Upload,
  Activity,
  CircleCheck,
  CircleX,
  RotateCw,
  Globe,
} from "lucide-react";
import { api, exportBackupUrl } from "@/lib/api";
import { formatBytes, pct, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SystemStats } from "@/lib/types";

const ACCENTS = {
  cpu: "border-main/30 bg-main/10 text-main",
  ram: "border-info/30 bg-info/10 text-info",
  swap: "border-success/30 bg-success/10 text-success",
  storage: "border-warning/30 bg-warning/10 text-warning",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  progress: number;
  accent: keyof typeof ACCENTS;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {label}
              </span>
            </div>
            <div className="mt-2 font-heading text-3xl">{value}</div>
          </div>
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-base border",
              ACCENTS[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} />
          <div className="mt-2 text-xs font-base text-muted">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const { t } = useI18n();
  const { data } = useQuery<SystemStats>({
    queryKey: ["system"],
    queryFn: api.system,
    refetchInterval: 3000,
  });
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = React.useState(false);

  const s = data;

  const restartMut = useMutation({
    mutationFn: () => api.restartXray(),
    onSuccess: () => toast.push("success", t("xrayRestarted")),
    onError: (e: Error) => toast.push("error", e.message),
  });

  const onExport = () => {
    window.open(exportBackupUrl(), "_blank");
    toast.push("success", t("backupExportStarted"));
  };

  const onImportClick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await api.importBackup(json);
      toast.push("success", t("backupImported"));
    } catch (err) {
      toast.push("error", (err as Error).message || t("invalidBackup"));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboard")} sub={t("liveMetrics")}>
        <Badge
          variant={s?.xray.running ? "success" : "danger"}
          className="h-10 justify-center gap-1.5 px-4 text-sm"
        >
          {s?.xray.running ? (
            <CircleCheck className="h-4 w-4 shrink-0" />
          ) : (
            <CircleX className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">
            Xray · {s?.xray.running ? t("running") : t("stopped")}
          </span>
        </Badge>
        <Button
          variant="neutral"
          className="h-10 justify-center gap-1.5 px-4 text-sm"
          onClick={() => restartMut.mutate()}
          disabled={restartMut.isPending}
        >
          <RotateCw className={cn("h-4 w-4 shrink-0", restartMut.isPending && "animate-spin")} />
          <span className="truncate">{t("restartXray")}</span>
        </Button>
      </PageHeader>

      {s && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-base border border-main/30 bg-main/10 text-main">
                <Globe className="h-5 w-5" />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t("serverIp")}
                  </div>
                  <div className="truncate font-semibold" dir="ltr">
                    {s.ip.address || t("unknown")}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t("location")}
                  </div>
                  <div className="truncate font-semibold">{s.ip.location || t("unknown")}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t("isp")}
                  </div>
                  <div className="truncate font-semibold">{s.ip.isp || t("unknown")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Cpu}
          label={t("cpu")}
          value={pct(s?.cpu.usage ?? 0)}
          sub={`${s?.cpu.cores ?? 0} ${t("cores")} · ${t("avg")} ${pct(s?.cpu.avg ?? 0)}`}
          progress={s?.cpu.usage ?? 0}
          accent="cpu"
        />
        <StatCard
          icon={MemoryStick}
          label={t("ram")}
          value={pct(s?.ram.usage ?? 0)}
          sub={`${formatBytes(s?.ram.used ?? 0)} / ${formatBytes(s?.ram.total ?? 0)}`}
          progress={s?.ram.usage ?? 0}
          accent="ram"
        />
        <StatCard
          icon={Layers}
          label={t("swap")}
          value={pct(s?.swap.usage ?? 0)}
          sub={`${formatBytes(s?.swap.used ?? 0)} / ${formatBytes(s?.swap.total ?? 0)}`}
          progress={s?.swap.usage ?? 0}
          accent="swap"
        />
        <StatCard
          icon={HardDrive}
          label={t("storage")}
          value={pct(s?.storage.usage ?? 0)}
          sub={`${t("free")} ${formatBytes(s?.storage.free ?? 0)}`}
          progress={s?.storage.usage ?? 0}
          accent="storage"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-main" />
            <CardTitle>{t("backupRestore")}</CardTitle>
          </div>
          <CardDescription>{t("backupDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={onExport}
              className="group flex items-center gap-3 rounded-base border border-border bg-surface2/40 p-4 text-start transition-colors hover:border-main/40 hover:bg-surface2/70"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-base border border-main/30 bg-main/10 text-main">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{t("exportBackup")}</div>
                <div className="mt-0.5 text-xs text-muted">{t("exportBackupDesc")}</div>
              </div>
            </button>
            <button
              onClick={onImportClick}
              disabled={importing}
              className="group flex items-center gap-3 rounded-base border border-border bg-surface2/40 p-4 text-start transition-colors hover:border-main/40 hover:bg-surface2/70 disabled:opacity-50"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-base border border-info/30 bg-info/10 text-info">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{importing ? t("importing") : t("importBackup")}</div>
                <div className="mt-0.5 text-xs text-muted">{t("importBackupDesc")}</div>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onFile}
            />
          </div>
          <p className="mt-3 text-xs font-base text-muted/80">{t("importWarning")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
