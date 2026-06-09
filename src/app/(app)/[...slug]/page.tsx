import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV, ROUTE_INDEX } from "@/lib/nav";
import { MODULE_SPECS, BESPOKE_ROUTES, type ModuleSpec } from "@/lib/data/modules";
import { ModuleWorkspace } from "@/components/module/module-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CatchAllPage({ params }: { params: { slug: string[] } }) {
  const pathname = "/" + (params.slug ?? []).join("/");

  // Bespoke routes are implemented as explicit files; if we reach the catch-all
  // for one, it means that file is missing — fall through to a generated spec.
  const meta = ROUTE_INDEX[pathname];
  if (!meta) notFound();

  // Parent/hub route (has children in nav) → render a module hub.
  const navItem = NAV.flatMap((s) => s.items).find((i) => i.href === pathname);
  if (navItem?.children?.length) {
    return <ModuleHub item={navItem} />;
  }

  const spec: ModuleSpec =
    MODULE_SPECS[pathname] ?? defaultSpec(meta.label, meta.section);

  // Avoid double-implementing a bespoke route via the generic renderer.
  if (BESPOKE_ROUTES.has(pathname) && !MODULE_SPECS[pathname]) {
    return <ModuleWorkspace meta={meta} spec={spec} />;
  }

  return <ModuleWorkspace meta={meta} spec={spec} />;
}

function ModuleHub({
  item,
}: {
  item: (typeof NAV)[number]["items"][number];
}) {
  return (
    <div className="space-y-5">
      <PageHeader
        title={item.label}
        description={`Operational workspaces within ${item.label}. Select a submodule to continue.`}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {item.children!.map((leaf) => {
          const spec = MODULE_SPECS[leaf.href];
          return (
            <Link key={leaf.href} href={leaf.href}>
              <Card className="group h-full transition-all hover:border-accent hover:shadow-md">
                <CardContent className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold tracking-tight">
                      {leaf.label}
                    </h3>
                    <ArrowRight
                      size={15}
                      className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>
                  <p className="mt-1.5 flex-1 text-xs text-muted-foreground leading-snug">
                    {spec?.summary ??
                      `${leaf.label} workspace within the ${item.label} module.`}
                  </p>
                  {leaf.srs && (
                    <div className="mt-3">
                      <Badge tone="neutral">SRS · {leaf.srs}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function defaultSpec(label: string, section: string): ModuleSpec {
  return {
    summary: `${label} workspace within the ${section} module group. Implements the SRS functional-requirement catalog for this area.`,
    kpis: [
      { label: "Records", value: "—", accent: "primary" },
      { label: "Open Items", value: "—", accent: "info" },
      { label: "This Month", value: "—", accent: "accent" },
      { label: "Status", value: "Active", accent: "success" },
    ],
    recordLabel: "Record",
    columns: [
      { key: "ref", header: "Reference", mono: true },
      { key: "name", header: "Name" },
      { key: "status", header: "Status", kind: "status" },
    ],
    rows: [
      { ref: "—", name: `${label} record`, status: "ACTIVE" },
    ],
    capabilities: [`Implements ${label} per the SRS functional specification.`],
  };
}
