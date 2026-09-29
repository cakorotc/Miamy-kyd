import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import { CredentialsCard } from "@/components/settings/credentials-card";
import { AdminsCard } from "@/components/settings/admins-card";

export default function SettingsPage() {
  const { isOwner } = useAuth();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings")} sub={t("manageAccount")} />

      {isOwner ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
          <div className="space-y-6">
            <CredentialsCard />
          </div>
          <AdminsCard />
        </div>
      ) : (
        <CredentialsCard />
      )}
    </div>
  );
}
