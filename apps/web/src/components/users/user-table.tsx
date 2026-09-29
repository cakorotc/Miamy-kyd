import { Infinity as InfinityIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { formatBytes, relativeTime, durationSince } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OnlineDot,
  InboundBadges,
  TrafficBar,
  UserActions,
  CreatorBadge,
  type UserActionHandlers,
} from "./user-bits";
import type { Inbound, User } from "@/lib/types";

interface UsersTableProps {
  users: User[];
  inbounds: Inbound[];
  onToggle: (id: number, enabled: boolean) => void;
  handlers: UserActionHandlers;
}

export function UsersTable({ users, inbounds, onToggle, handlers }: UsersTableProps) {
  const { t } = useI18n();
  const { isOwner } = useAuth();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{t("actions")}</TableHead>
              <TableHead className="text-center">{t("enabled")}</TableHead>
              <TableHead className="text-center">{t("status")}</TableHead>
              <TableHead>{t("client")}</TableHead>
              <TableHead>{t("inbounds")}</TableHead>
              <TableHead className="min-w-[180px]">{t("traffic")}</TableHead>
              <TableHead className="text-center">{t("remaining")}</TableHead>
              <TableHead className="text-center">{t("duration")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex justify-center">
                    <UserActions user={u} handlers={handlers} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Switch
                      checked={!!u.enabled}
                      onCheckedChange={(v) => onToggle(u.id, v)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <OnlineDot online={u.online} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px]">
                    <div className="truncate font-semibold" title={u.email}>
                      {u.email}
                    </div>
                    {u.comment && (
                      <div className="truncate text-xs text-muted">{u.comment}</div>
                    )}
                    {isOwner && u.creator && <CreatorBadge name={u.creator} />}
                  </div>
                </TableCell>
                <TableCell>
                  <InboundBadges user={u} inbounds={inbounds} />
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <TrafficBar user={u} />
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">
                  <div className="flex flex-col items-center">
                    {u.data_limit <= 0 ? (
                      <InfinityIcon className="h-4 w-4 text-muted" />
                    ) : (
                      formatBytes(Math.max(0, u.data_limit - u.total))
                    )}
                    {u.expire_at && (
                      <div className="text-xs text-muted">{relativeTime(u.expire_at)}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">
                  <div className="flex justify-center">
                    {u.expire_at ? (
                      durationSince(u.created_at)
                    ) : (
                      <InfinityIcon className="h-4 w-4 text-muted" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
