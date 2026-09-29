import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Plus, Trash2, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiCombobox, type ComboItem } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Inbound, RoutingRule, RoutingPreset } from "@/lib/types";

export default function RoutingPage() {
  const toast = useToast();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [values, setValues] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<number[]>([]);
  const labelsRef = React.useRef<Record<string, string>>({});

  const { data: rules = [] } = useQuery<RoutingRule[]>({
    queryKey: ["routing"],
    queryFn: api.routing,
  });
  const { data: inbounds = [] } = useQuery<Inbound[]>({
    queryKey: ["inbounds"],
    queryFn: api.inbounds,
  });
  const { data: presets } = useQuery<{ domains: RoutingPreset[]; ips: RoutingPreset[] }>({
    queryKey: ["routing-presets"],
    queryFn: api.routingPresets,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["routing"] });

  const addMut = useMutation({
    mutationFn: async () => {
      for (const v of values) {
        await api.addRouting(v, selected, "domain", labelsRef.current[v] || v);
      }
    },
    onSuccess: () => {
      toast.push("success", t("blockRulesAdded"));
      setValues([]);
      setSelected([]);
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteRouting(id),
    onSuccess: () => {
      toast.push("success", t("ruleRemoved"));
      invalidate();
    },
    onError: (e: Error) => toast.push("error", e.message),
  });

  const domainItems: ComboItem[] = React.useMemo(
    () =>
      (presets?.domains ?? []).map((p) => ({
        value: p.values[0],
        label: p.label,
        group: t("presets"),
      })),
    [presets, t],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (values.length === 0) {
      toast.push("error", t("chooseDomain"));
      return;
    }
    if (selected.length === 0) {
      toast.push("error", t("chooseInbound"));
      return;
    }
    addMut.mutate();
  };

  const toggle = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const selectAll = () =>
    setSelected(selected.length === inbounds.length ? [] : inbounds.map((i) => i.id));

  const inboundName = (id: number) => inbounds.find((i) => i.id === id)?.tag || `#${id}`;

  return (
    <div className="space-y-6">
      <PageHeader title={t("routing")} sub={t("routingDesc")} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-main" />
              <CardTitle>{t("blockDomains")}</CardTitle>
            </div>
            <CardDescription>{t("blockDomainsHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <MultiCombobox
                items={domainItems}
                selected={values}
                onChange={setValues}
                labels={labelsRef.current}
                placeholder={t("domainPlaceholder")}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-muted">{t("applyToInbounds")}</div>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs font-semibold text-main underline-offset-2 hover:underline"
                  >
                    {selected.length === inbounds.length ? t("clearAll") : t("selectAll")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {inbounds.map((ib) => {
                    const active = selected.includes(ib.id);
                    return (
                      <button
                        key={ib.id}
                        type="button"
                        onClick={() => toggle(ib.id)}
                        className={cn(
                          "min-w-[calc(50%-0.25rem)] flex-1 rounded-base border px-3 py-2 text-center text-xs font-semibold transition-colors sm:min-w-[calc(33.333%-0.5rem)]",
                          active
                            ? "border-main/40 bg-main/15 text-main"
                            : "border-border bg-surface2/40 text-muted hover:text-text",
                        )}
                      >
                        {ib.tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={addMut.isPending}>
                <Plus className="h-4 w-4" />
                {t("addBlockRule")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-main" />
              <CardTitle>{t("blockedDomains")}</CardTitle>
            </div>
            <CardDescription>
              {rules.length} {t("activeRules")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rules.length === 0 && (
              <div className="rounded-base border border-dashed border-border/70 py-10 text-center text-sm text-muted">
                {t("noBlockRules")}
              </div>
            )}
            {rules.map((r) => (
              <div
                key={r.id}
                className="rounded-base border border-border bg-surface2/40 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-base border border-danger/30 bg-danger/10 text-danger">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold" dir="ltr">
                      {r.label || r.domain}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => deleteMut.mutate(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {(r.inbound_ids.length === 0 ? inbounds.map((i) => i.id) : r.inbound_ids).map(
                    (id) => (
                      <Badge
                        key={id}
                        variant="neutral"
                        className="max-w-full truncate text-[10px]"
                      >
                        {inboundName(id)}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
