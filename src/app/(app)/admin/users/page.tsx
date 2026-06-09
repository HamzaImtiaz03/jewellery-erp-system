"use client";

import * as React from "react";
import { Plus, Shield, Check, X, UserPlus, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface User { name: string; email: string; role: string; branch: string; status: string; lastSeen: string; }
const users: User[] = [
  { name: "Danish Hakeem", email: "danish@aurum.sa", role: "Controller", branch: "All Branches", status: "ACTIVE", lastSeen: "now" },
  { name: "Mona Tariq", email: "mona@aurum.sa", role: "Branch Manager", branch: "Olaya", status: "ACTIVE", lastSeen: "5m ago" },
  { name: "Noura Saleh", email: "noura@aurum.sa", role: "Cashier", branch: "Olaya", status: "ACTIVE", lastSeen: "2m ago" },
  { name: "Faisal Ahmed", email: "faisal@aurum.sa", role: "Cashier", branch: "Granada", status: "ACTIVE", lastSeen: "12m ago" },
  { name: "Suresh Menon", email: "suresh@aurum.sa", role: "Karigar", branch: "Workshop", status: "ACTIVE", lastSeen: "1h ago" },
  { name: "Hamza Idris", email: "hamza@aurum.sa", role: "Accountant", branch: "Granada", status: "INVITED", lastSeen: "—" },
  { name: "Sara Khan", email: "sara@aurum.sa", role: "Branch Manager", branch: "Tahlia", status: "ACTIVE", lastSeen: "3h ago" },
  { name: "Old Account", email: "legacy@aurum.sa", role: "Cashier", branch: "Olaya", status: "DISABLED", lastSeen: "30d ago" },
];

const roles = [
  { code: "CONTROLLER", name: "Financial Controller", users: 1, system: true, perms: 428 },
  { code: "MANAGER", name: "Branch Manager", users: 2, system: true, perms: 286 },
  { code: "CASHIER", name: "Cashier / POS", users: 3, system: true, perms: 64 },
  { code: "KARIGAR", name: "Karigar", users: 1, system: true, perms: 18 },
  { code: "ACCOUNTANT", name: "Accountant", users: 1, system: true, perms: 142 },
  { code: "COMPLIANCE", name: "Compliance Officer", users: 0, system: false, perms: 38 },
];

const modules = ["Sales", "Inventory", "Jewellery", "Finance", "HR", "CRM", "Admin"];
const actions = ["View", "Create", "Update", "Post/Void", "Approve"];
// matrix[roleCode][module] = boolean[5] for the 5 actions
const matrix: Record<string, Record<string, boolean[]>> = {
  CONTROLLER: { Sales: [1,1,1,1,1], Inventory:[1,1,1,1,1], Jewellery:[1,1,1,1,1], Finance:[1,1,1,1,1], HR:[1,1,1,1,1], CRM:[1,1,1,1,1], Admin:[1,1,1,1,1] } as any,
  MANAGER:    { Sales: [1,1,1,1,1], Inventory:[1,1,1,1,0], Jewellery:[1,1,1,0,0], Finance:[1,0,0,0,0], HR:[1,1,0,0,0], CRM:[1,1,1,0,1], Admin:[1,0,0,0,0] } as any,
  CASHIER:    { Sales: [1,1,1,0,0], Inventory:[1,0,0,0,0], Jewellery:[1,0,0,0,0], Finance:[0,0,0,0,0], HR:[0,0,0,0,0], CRM:[1,1,0,0,0], Admin:[0,0,0,0,0] } as any,
  KARIGAR:    { Sales: [0,0,0,0,0], Inventory:[1,0,1,0,0], Jewellery:[1,1,1,0,0], Finance:[0,0,0,0,0], HR:[0,0,0,0,0], CRM:[0,0,0,0,0], Admin:[0,0,0,0,0] } as any,
  ACCOUNTANT: { Sales: [1,0,0,0,0], Inventory:[1,0,0,0,0], Jewellery:[1,0,0,0,0], Finance:[1,1,1,1,0], HR:[1,0,0,0,0], CRM:[1,0,0,0,0], Admin:[0,0,0,0,0] } as any,
  COMPLIANCE: { Sales: [1,0,0,0,1], Inventory:[1,0,0,0,0], Jewellery:[1,0,0,0,0], Finance:[1,0,0,0,0], HR:[1,0,0,0,0], CRM:[1,0,1,0,1], Admin:[1,0,0,0,0] } as any,
};

export default function UsersPage() {
  const [activeRole, setActiveRole] = React.useState("MANAGER");

  const cols: Column<User>[] = [
    { key: "name", header: "User", cell: (u) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={u.name} size="sm" />
        <div className="leading-tight">
          <p className="text-[13px] font-medium">{u.name}</p>
          <p className="text-[11px] text-muted-foreground">{u.email}</p>
        </div>
      </div>
    )},
    { key: "role", header: "Role", cell: (u) => <Badge tone="primary">{u.role}</Badge> },
    { key: "branch", header: "Branch Scope", cell: (u) => <span className="text-muted-foreground">{u.branch}</span> },
    { key: "lastSeen", header: "Last Active", cell: (u) => <span className="text-muted-foreground">{u.lastSeen}</span> },
    { key: "status", header: "Status", cell: (u) => <StatusBadge status={u.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & Roles"
        description="Enterprise RBAC — users hold roles, roles grant permissions, every endpoint declares one required permission (SRS §6)."
        actions={
          <>
            <Button variant="outline" size="sm" icon={Shield}>New Role</Button>
            <Button size="sm" icon={UserPlus}>Invite User</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Users" value="6" accent="primary" />
        <StatCard label="Roles" value="6" accent="info" />
        <StatCard label="Permissions" value="428" icon={KeyRound} accent="accent" />
        <StatCard label="Sensitive Grants" value="48" accent="danger" />
      </div>

      <Card className="overflow-hidden">
        <Tabs defaultValue="users">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger value="users" count={users.length}>Users</TabsTrigger>
              <TabsTrigger value="roles" count={roles.length}>Roles</TabsTrigger>
              <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <DataTable columns={cols} data={users} rowKey={(u) => u.email} searchPlaceholder="Search users…" />
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((r) => (
                <Card key={r.code} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary">
                        <Shield size={17} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground tnum">{r.code}</p>
                      </div>
                    </div>
                    {r.system && <Badge tone="neutral">System</Badge>}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">{r.users} users</span>
                    <span className="font-medium">{r.perms} permissions</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">Edit permissions</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matrix">
            <div className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground mr-1">Role:</span>
                {roles.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => setActiveRole(r.code)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                      activeRole === r.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Module</th>
                      {actions.map((a) => (
                        <th key={a} className="px-3 py-2.5 text-center font-semibold">{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {modules.map((mod) => (
                      <tr key={mod} className="hover:bg-muted/30">
                        <td className="px-4 py-2.5 font-medium">{mod}</td>
                        {(matrix[activeRole]?.[mod] ?? [0,0,0,0,0]).map((granted, i) => (
                          <td key={i} className="px-3 py-2.5 text-center">
                            {granted ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-muted text-success">
                                <Check size={13} strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                                <X size={12} />
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                Effective permissions = union of the user's roles' permissions, honouring branch scope. Sensitive actions (rate edit, void, day re-open) require an additional grant and are audited (§6.3).
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
