import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CredentialsCard() {
  const toast = useToast();
  const { t } = useI18n();
  const { username, refresh } = useAuth();
  const [newUsername, setNewUsername] = React.useState(username || "");
  const [newPassword, setNewPassword] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");

  const credMut = useMutation({
    mutationFn: () =>
      api.changeCredentials({
        currentPassword,
        newUsername: newUsername || undefined,
        newPassword: newPassword || undefined,
      }),
    onSuccess: async () => {
      toast.push("success", t("credentialsUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      await refresh();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim().length < 3) {
      toast.push("error", t("usernameMin"));
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.push("error", t("passwordMin"));
      return;
    }
    if (!currentPassword) {
      toast.push("error", t("enterCurrent"));
      return;
    }
    credMut.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-main" />
          <CardTitle>{t("changeCredentials")}</CardTitle>
        </div>
        <CardDescription>{t("changeCredentialsDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="newUsername">{t("username")}</Label>
            <Input
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("newPassword")}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("leaveBlank")}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={credMut.isPending} className="w-full sm:w-auto">
            <Save className="h-4 w-4" />
            {credMut.isPending ? t("saving") : t("saveChanges")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
