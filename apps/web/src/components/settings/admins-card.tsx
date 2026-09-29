import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users2, Plus, Trash2, ShieldCheck, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useI18n, type TKey } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatBytes } from "@/lib/utils";
import type { AdminInfo, Permission } from "@/lib/types";

const PERMISSION_KEYS: Record<Permission, TKey> = {
  dashboard: "dashboard",
  users: "users",
  inbounds: "inbounds",
  routing: "routing",
  activity: "activityLog",
  bot: "telegramBot",
  settings: "settings",
};

const ASSIGNABLE_PERMS: Permission[] = [
  "dashboard",
  "users",
  "inbounds",
  "routing",
  "activity",
  "bot",
];

function AdminDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: AdminInfo | null;
}) {
  const toast = useToast();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [permissions, setPermissions] = React.useState<Permission[]>(["users"]);
  const [dataLimit, setDataLimit] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setUsername(editing.username);
      setPassword("");
      setPermissions(editing.permissions);
      setDataLimit(Math.round((editing.dataLimit / 1024 ** 3) * 100) / 100);
    } else {
      setUsername("");
      setPassword("");
      setPermissions(["users"]);
      setDataLimit(0);
    }
  }, [open, editing]);

  const createMut = useMutation({
    mutationFn: () => api.createAdmin({ username, password, permissions, dataLimit }),
    onSuccess: () => {
      toast.push("success", t("adminCreated"));
      qc.invalidateQueries({ queryKey: ["admins"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const updateMut = useMutation({
    mutationFn: () =>
      api.updateAdmin(editing!.id, {
        permissions,
        dataLimit,
        password: password || undefined,
      }),
    onSuccess: () => {
      toast.push("success", t("adminUpdated"));
      qc.invalidateQueries({ queryKey: ["admins"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const toggle = (p: Permission) =>
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && username.trim().length < 3) {
      toast.push("error", t("usernameMin"));
      return;
    }
    if (!editing && password.length < 6) {
      toast.push("error", t("passwordMin"));
      return;
    }
    if (editing && password && password.length < 6) {
      toast.push("error", t("passwordMin"));
      return;
    }
    if (permissions.length === 0) {
      toast.push("error", t("selectPage"));
      return;
    }
    if (editing) updateMut.mutate();
    else createMut.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? `${t("edit")} ${editing.username}` : t("addAdmin")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {!editing && (
            <div className="space-y-2">
              <Label htmlFor="adminUsername">{t("username")}</Label>
              <Input
                id="adminUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 24))}
                maxLength={24}
                autoFocus
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="adminPassword">
              {editing ? t("passwordOptional") : t("password")}
            </Label>
            <Input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder={editing ? t("leaveBlank") : t("atLeast6")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("pageAccess")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {ASSIGNABLE_PERMS.map((p) => {
                const active = permissions.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    className={cn(
                      "rounded-base border px-3 py-2 text-start text-sm font-semibold transition-colors",
                      active
                        ? "border-main/40 bg-main/15 text-main"
                        : "border-border bg-surface2/40 text-muted hover:text-text",
                    )}
                  >
                    {t(PERMISSION_KEYS[p])}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted/80">{t("adminNoSettings")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("dataQuota")}</Label>
            <NumberInput value={dataLimit} onChange={setDataLimit} step={1} suffix="GB" />
            <p className="text-[11px] text-muted/80">{t("unlimitedHint")}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {editing ? t("save") : t("addAdmin")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminsCard() {
  const toast = useToast();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminInfo | null>(null);

  const { data } = useQuery({ queryKey: ["admins"], queryFn: api.admins });
  const admins = (data?.admins ?? []).filter((a) => a.role !== "owner");

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteAdmin(id),
    onSuccess: () => {
      toast.push("success", t("adminRemoved"));
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-main" />
              <CardTitle>{t("admins")}</CardTitle>
            </div>
            <CardDescription>{t("adminsDesc")}</CardDescription>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("addAdmin")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-3 sm:grid-cols-2">
        {admins.length === 0 && (
          <div className="col-span-full rounded-base border border-dashed border-border/70 py-10 text-center text-sm text-muted">
            {t("noAdmins")}
          </div>
        )}
        {admins.map((a) => (
          <div
            key={a.id}
            className="flex min-w-0 flex-col gap-3 rounded-base border border-border bg-surface2/40 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-main/40 bg-main/10 font-heading uppercase text-main">
                  {a.username.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="max-w-[140px] truncate font-semibold" title={a.username}>
                      {a.username}
                    </span>
                    <Badge variant="info" className="gap-1 text-[10px]">
                      <ShieldCheck className="h-3 w-3" /> {t("admin")}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="neutral"
                  size="icon-sm"
                  onClick={() => {
                    setEditing(a);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="danger"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(a)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {a.permissions.length === 0 ? (
                <span className="text-xs text-muted/60">{t("adminNoSettings")}</span>
              ) : (
                a.permissions.map((p) => (
                  <Badge key={p} variant="neutral" className="text-[10px]">
                    {t(PERMISSION_KEYS[p])}
                  </Badge>
                ))
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
              <div className="min-w-0">
                <div className="truncate font-heading text-sm">{a.userCount ?? 0}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {t("adminUsers")}
                </div>
              </div>
              <div className="min-w-0">
                <div className="truncate font-heading text-sm">{formatBytes(a.used ?? 0)}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {t("used")}
                </div>
              </div>
              <div className="min-w-0">
                <div className="truncate font-heading text-sm">
                  {a.dataLimit > 0 ? formatBytes(a.dataLimit) : "∞"}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {t("quota")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <AdminDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("removeAdmin")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm font-base text-muted">
            {t("removeAdminConfirm")}{" "}
            <span className="font-semibold text-text">{deleteTarget?.username}</span>?
          </p>
          <DialogFooter>
            <Button variant="neutral" onClick={() => setDeleteTarget(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              <Trash2 className="h-4 w-4" />
              {t("remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
