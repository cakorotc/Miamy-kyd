import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users2, Wifi, ShieldCheck, BatteryWarning, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { SummaryCard, SUMMARY_ACCENTS, type UserActionHandlers } from "@/components/users/user-bits";
import { UsersTable } from "@/components/users/user-table";
import { UserCard } from "@/components/users/user-card";
import { useI18n } from "@/lib/i18n";
import type { Inbound, User, UserFormValues, UserSummary } from "@/lib/types";

const EMPTY_SUMMARY: UserSummary = { clients: 0, online: 0, active: 0, depleting: 0 };

export default function UsersPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { t } = useI18n();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);

  const { data } = useQuery<{ users: User[]; summary: UserSummary }>({
    queryKey: ["users"],
    queryFn: api.users,
    refetchInterval: 5000,
  });
  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });

  const createMut = useMutation({
    mutationFn: (v: UserFormValues) => api.createUser(v),
    onSuccess: () => {
      toast.push("success", t("userCreated"));
      setFormOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: number; v: UserFormValues }) => api.updateUser(id, v),
    onSuccess: () => {
      toast.push("success", t("userUpdated"));
      setFormOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      api.toggleUser(id, enabled),
    onSuccess: invalidate,
    onError: (e: Error) => toast.push("error", e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => {
      toast.push("success", t("userDeleted"));
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const resetMut = useMutation({
    mutationFn: (id: number) => api.resetTraffic(id),
    onSuccess: () => {
      toast.push("success", t("trafficReset"));
      invalidate();
    },
  });

  const rotateMut = useMutation({
    mutationFn: (id: number) => api.rotateToken(id),
    onSuccess: () => {
      toast.push("success", t("tokenRotated"));
      invalidate();
    },
  });

  const users = data?.users ?? [];
  const summary = data?.summary ?? EMPTY_SUMMARY;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const copySubLink = (u: User) => {
    const url = `${window.location.origin}/sub/${u.sub_token}`;
    void navigator.clipboard.writeText(url);
    toast.push("success", t("subLinkCopied"));
  };

  const handlers: UserActionHandlers = {
    onEdit: (u) => {
      setEditing(u);
      setFormOpen(true);
    },
    onCopySub: copySubLink,
    onReset: (u) => resetMut.mutate(u.id),
    onRotate: (u) => rotateMut.mutate(u.id),
    onDelete: (u) => setDeleteTarget(u),
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("users")} sub={t("manageClients")}>
        <Button onClick={openNew} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4" />
          {t("newUser")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SummaryCard icon={Users2} label={t("clients")} value={summary.clients} accent={SUMMARY_ACCENTS.clients} />
        <SummaryCard icon={Wifi} label={t("online")} value={summary.online} accent={SUMMARY_ACCENTS.online} />
        <SummaryCard icon={ShieldCheck} label={t("active")} value={summary.active} accent={SUMMARY_ACCENTS.active} />
        <SummaryCard icon={BatteryWarning} label={t("depleting")} value={summary.depleting} accent={SUMMARY_ACCENTS.depleting} />
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted">{t("noUsers")}</CardContent>
        </Card>
      )}

      <div className="hidden lg:block">
        {users.length > 0 && (
          <UsersTable
            users={users}
            inbounds={inbounds}
            onToggle={(id, enabled) => toggleMut.mutate({ id, enabled })}
            handlers={handlers}
          />
        )}
      </div>

      <div className="grid min-w-0 gap-3 lg:hidden">
        {users.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            inbounds={inbounds}
            onToggle={(id, enabled) => toggleMut.mutate({ id, enabled })}
            handlers={handlers}
          />
        ))}
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        inbounds={inbounds}
        editing={editing}
        onSubmit={async (v) => {
          if (editing) await updateMut.mutateAsync({ id: editing.id, v });
          else await createMut.mutateAsync(v);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteUser")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm font-base text-muted">
            {t("deleteUserConfirm")}{" "}
            <span className="font-semibold text-text">{deleteTarget?.email}</span>?{" "}
            {t("cannotUndo")}
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
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
