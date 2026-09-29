import { Infinity as InfinityIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { formatBytes, relativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  OnlineDot,
  InboundBadges,
  TrafficBar,
  UserActions,
  CreatorBadge,
  type UserActionHandlers,
} from "./user-bits";
import type { Inbound, User } from "@/lib/types";

interface UserCardProps {
  user: User;
  inbounds: Inbound[];
  onToggle: (id: number, enabled: boolean) => void;
  handlers: UserActionHandlers;
}

export function UserCard({ user, inbounds, onToggle, handlers }: UserCardProps) {
  const { t } = useI18n();
  const { isOwner } = useAuth();
  const u = user;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-main/40 bg-main/10 font-heading text-lg uppercase text-main">
            {u.email.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold" title={u.email}>
              {u.email}
            </div>
            <div className="mt-0.5">
              <OnlineDot online={u.online} />
            </div>
          </div>
          <Switch
            checked={!!u.enabled}
            onCheckedChange={(v) => onToggle(u.id, v)}
          />
        </div>

        {u.comment && (
          <div className="truncate text-center text-xs text-muted" title={u.comment}>
            {u.comment}
          </div>
        )}
        {isOwner && u.creator && (
          <div className="flex justify-center">
            <CreatorBadge name={u.creator} />
          </div>
        )}

        <div className="min-w-0">
          <InboundBadges user={u} inbounds={inbounds} center all />
        </div>
        <TrafficBar user={u} />

        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center">
          <div className="rounded-base border border-border bg-surface2/40 py-2">
            <div className="flex items-center justify-center gap-1 font-heading text-sm">
              {u.data_limit <= 0 ? (
                <InfinityIcon className="h-4 w-4" />
              ) : (
                formatBytes(Math.max(0, u.data_limit - u.total))
              )}
            </div>
            <div className="truncate px-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              {t("remaining")}
            </div>
          </div>
          <div className="rounded-base border border-border bg-surface2/40 py-2">
            <div className="flex items-center justify-center gap-1 font-heading text-sm">
              {u.expire_at ? relativeTime(u.expire_at) : <InfinityIcon className="h-4 w-4" />}
            </div>
            <div className="truncate px-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              {t("expires")}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <UserActions user={u} handlers={handlers} />
        </div>
      </CardContent>
    </Card>
  );
}
