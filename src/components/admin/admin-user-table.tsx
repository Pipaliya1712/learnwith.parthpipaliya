"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { blockUser, unblockUser, updateUserRole } from "@/app/actions/users";
import type { Profile } from "@/types";
import { format } from "date-fns";

type AdminUserTableProps = {
  users: Pick<Profile, "id" | "email" | "display_name" | "role" | "is_blocked" | "created_at">[];
  isSuperAdmin?: boolean;
};

export function AdminUserTable({ users: initialUsers, isSuperAdmin }: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers);

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const result = isBlocked
      ? await unblockUser(userId)
      : await blockUser(userId);

    if (result.error) {
      toast.error(result.error);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_blocked: !isBlocked } : u
        )
      );
      toast.success(isBlocked ? "User unblocked" : "User blocked");
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "developer" : "admin";
    const result = await updateUserRole(userId, newRole);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      toast.success(`User role updated to ${newRole}`);
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No users registered yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {(user.display_name || user.email)[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user.display_name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_blocked ? "destructive" : "outline"}>
                    {user.is_blocked ? "Blocked" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-6">
                    {isSuperAdmin && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                          Admin
                        </span>
                        <Switch
                          checked={user.role === "admin"}
                          onCheckedChange={() =>
                            handleToggleRole(user.id, user.role)
                          }
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
