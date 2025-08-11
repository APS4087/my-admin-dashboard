"use client";

import { useEffect, useState } from "react";

import { Check, Clock, User, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { getAllUsers, approveUser, unapproveUser, getPendingUsers } from "@/lib/admin-utils";
import type { Profile } from "@/types/auth";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserRow = ({
  user,
  showApprovalActions = true,
  actionLoading,
  onApprove,
  onUnapprove,
}: {
  user: Profile;
  showApprovalActions?: boolean;
  actionLoading: string | null;
  onApprove: (userId: string) => void;
  onUnapprove: (userId: string) => void;
}) => (
  <TableRow key={user.id}>
    <TableCell>
      <div className="flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-medium">{user.full_name ?? "No name"}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Badge variant={user.role === "admin" || user.role === "administrator" ? "default" : "secondary"}>
        {user.role}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge variant={user.approved ? "default" : "destructive"}>{user.approved ? "Approved" : "Pending"}</Badge>
    </TableCell>
    <TableCell className="text-sm text-gray-500">{formatDate(user.created_at)}</TableCell>
    {showApprovalActions && (
      <TableCell>
        <div className="flex space-x-2">
          {!user.approved ? (
            <Button size="sm" onClick={() => onApprove(user.id)} disabled={actionLoading === user.id} className="h-8">
              {actionLoading === user.id ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              <span className="ml-1">Approve</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUnapprove(user.id)}
              disabled={actionLoading === user.id}
              className="h-8"
            >
              {actionLoading === user.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              <span className="ml-1">Revoke</span>
            </Button>
          )}
        </div>
      </TableCell>
    )}
  </TableRow>
);

export default function UserApprovalPage() {
  const { profile } = useAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = profile?.role === "admin" || profile?.role === "administrator";

  const loadData = async () => {
    try {
      const [allUsersData, pendingUsersData] = await Promise.all([getAllUsers(), getPendingUsers()]);
      setAllUsers(allUsersData ?? []);
      setPendingUsers(pendingUsersData ?? []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await approveUser(userId);
      toast.success("User approved successfully");
      await loadData();
    } catch (error) {
      console.error("Failed to approve user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnapproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await unapproveUser(userId);
      toast.success("User approval revoked");
      await loadData();
    } catch (error) {
      console.error("Failed to revoke user approval:", error);
      toast.error("Failed to revoke user approval");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-background flex min-h-96 flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <X className="text-destructive mx-auto size-12" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground mt-4">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user approvals and access controls</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
            <Check className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{allUsers.filter((u) => u.approved).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter((u) => u.role === "admin" || u.role === "administrator").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="all">All Users ({allUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Users Awaiting Approval
              </CardTitle>
              <CardDescription>Review and approve user accounts to grant system access</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No users pending approval</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        actionLoading={actionLoading}
                        onApprove={handleApproveUser}
                        onUnapprove={handleUnapproveUser}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    All Users
                  </CardTitle>
                  <CardDescription>View and manage all user accounts</CardDescription>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {allUsers.length === 0 ? (
                <div className="py-8 text-center">
                  <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        actionLoading={actionLoading}
                        onApprove={handleApproveUser}
                        onUnapprove={handleUnapproveUser}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
