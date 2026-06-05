"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { usersApi } from "@/lib/api-client";
import type { Profile } from "@/types";
import { format } from "date-fns";

type AdminUserTableProps = {
  users: Pick<Profile, "id" | "email" | "display_name" | "role" | "is_blocked" | "created_at">[];
  total: number;
  currentPage: number;
  pageSize?: number;
  isSuperAdmin?: boolean;
};

type AdminUserRow = AdminUserTableProps["users"][number];

export function AdminUserTable({
  users: initialUsers,
  total,
  currentPage,
  pageSize = 10,
  isSuperAdmin,
}: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers);

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await usersApi.unblock(userId);
      } else {
        await usersApi.block(userId);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_blocked: !isBlocked } : u
        )
      );
      toast.success(isBlocked ? "User unblocked" : "User blocked");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update user block status"));
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "developer" : "admin";
    try {
      await usersApi.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      toast.success(`User role updated to ${newRole}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update user role"));
    }
  };

  const columns: ColumnDef<AdminUserRow>[] = [
    {
      key: "user",
      header: "User",
      sortable: true,
      searchable: true,
      searchPlaceholder: "Search users...",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {(user.display_name || user.email)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {user.display_name || "No username"}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      filterOptions: [
        { label: "Admin", value: "admin" },
        { label: "Developer", value: "developer" },
      ],
      cell: (user) => (
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Blocked", value: "blocked" },
      ],
      cell: (user) => (
        <Badge variant={user.is_blocked ? "destructive" : "outline"}>
          {user.is_blocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      sortable: true,
      cell: (user) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(user.created_at), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      cell: (user) => (
        <div className="flex items-center justify-end gap-6">
          {isSuperAdmin && !user.is_blocked && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                Admin
              </span>
              <Switch
                checked={user.role === "admin"}
                onCheckedChange={() => handleToggleRole(user.id, user.role)}
              />
            </div>
          )}

          {user.role !== "admin" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                {user.is_blocked ? "Unblock" : "Block"}
              </span>
              <Switch
                checked={user.is_blocked}
                onCheckedChange={() =>
                  handleToggleBlock(user.id, user.is_blocked)
                }
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      total={total}
      pageSize={pageSize}
      currentPage={currentPage}
    />
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
