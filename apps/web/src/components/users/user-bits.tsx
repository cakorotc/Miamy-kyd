import * as React from "react";
import {
  Pencil,
  Link2,
  RotateCcw,
  RefreshCw,
  MoreVertical,
  Copy,
  Server,
  Trash2,
  UserCog,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatBytes, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Inbound, User } from "@/lib/types";

export const SUMMARY_ACCENTS: Record<"clients" | "online" | "active" | "depleting", string> = {
  clients: "border-main/30 bg-main/10 text-main",
  online: "border-success/30 bg-success/10 text-success",
  active: "border-info/30 bg-info/10 text-info",
  depleting: "border-danger/30 bg-danger/10 text-danger",
};

export function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-base border sm:h-12 sm:w-12",
            accent,
          )}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <div className="font-heading text-2xl leading-none sm:text-3xl">{value}</div>
          <div className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrafficBar({ user }: { user: User }) {
  const usagePct = user.data_limit > 0 ? Math.min(100, (user.total / user.data_limit) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs font-base text-muted">
        <span className="font-semibold text-text/90">{formatBytes(user.total)}</span>
        {user.data_limit > 0 && <span>{formatBytes(user.data_limit)}</span>}
      </div>
      <Progress
        value={user.data_limit > 0 ? usagePct : 100}
        className="h-2"
        indicatorClassName={
          usagePct > 90 ? "bg-danger" : usagePct > 70 ? "bg-warning" : "bg-main"
        }
      />
      <div className="flex items-center gap-3 text-[11px] font-base">
        <span className="text-success">↓ {formatBytes(user.down)}</span>
        <span className="text-info">↑ {formatBytes(user.up)}</span>
      </div>
    </div>
  );
}

export function OnlineDot({ online }: { online: boolean }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full",
          online ? "animate-pulse bg-success" : "bg-muted/50",
        )}
      />
      <span className="text-xs font-base text-muted">
        {online ? t("online") : t("offline")}
      </span>
    </span>
  );
}

export function InboundBadges({
  user,
  inbounds,
  center,
  all,
}: {
  user: User;
  inbounds: Inbound[];
  center?: boolean;
  all?: boolean;
}) {
  const { t } = useI18n();
  const inboundName = (id: number) => inbounds.find((i) => i.id === id)?.tag || `#${id}`;
  const ids = all ? user.inbound_ids : user.inbound_ids.slice(0, 3);
  return (
    <div className={cn("flex flex-wrap gap-1", center && "justify-center")}>
      {user.inbound_ids.length === 0 && (
        <span className="text-xs text-muted/60">{t("none")}</span>
      )}
      {ids.map((id) => (
        <Badge key={id} variant="neutral" className="text-[10px]">
          {inboundName(id)}
        </Badge>
      ))}
      {!all && user.inbound_ids.length > 3 && (
        <Badge variant="info" className="text-[10px]">
          +{user.inbound_ids.length - 3}
        </Badge>
      )}
    </div>
  );
}

export interface UserActionHandlers {
  onEdit: (u: User) => void;
  onCopySub: (u: User) => void;
  onReset: (u: User) => void;
  onRotate: (u: User) => void;
  onDelete: (u: User) => void;
}

export function UserActions({ user, handlers }: { user: User; handlers: UserActionHandlers }) {
  const { t } = useI18n();
  const openSub = () => window.open(`/sub/${user.sub_token}`, "_blank");
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="neutral"
        size="icon-sm"
        onClick={() => handlers.onEdit(user)}
        title={t("edit")}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="neutral"
        size="icon-sm"
        onClick={() => handlers.onCopySub(user)}
        title={t("copySubLink")}
      >
        <Link2 className="h-3.5 w-3.5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="neutral" size="icon-sm" title={t("more")}>
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handlers.onCopySub(user)}>
            <Copy className="h-4 w-4 text-muted" />
            {t("copySubLink")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openSub}>
            <Server className="h-4 w-4 text-muted" />
            {t("openSubPage")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onReset(user)}>
            <RotateCcw className="h-4 w-4 text-muted" />
            {t("resetTraffic")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onRotate(user)}>
            <RefreshCw className="h-4 w-4 text-muted" />
            {t("rotateSubToken")}
          </DropdownMenuItem>
          <DropdownMenuItem danger onClick={() => handlers.onDelete(user)}>
            <Trash2 className="h-4 w-4" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CreatorBadge({ name }: { name: string }) {
  return (
    <Badge variant="neutral" className="mt-1 gap-1 text-[10px]">
      <UserCog className="h-3 w-3 shrink-0" />
      <span className="truncate">{name}</span>
    </Badge>
  );
}

export function UnlimitedOrValue({ value, children }: { value: number; children: React.ReactNode }) {
  return value <= 0 ? <InfinityIcon className="h-4 w-4 text-muted" /> : <>{children}</>;
}
