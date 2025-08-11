"use client";

import { useEffect, useState } from "react";

import { Users, UserCheck, UserX, Building, Ship, Anchor, Wrench, Key } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeService } from "@/lib/employee-service";
import { shipAuthService } from "@/lib/ship-auth-service";
import { shipService } from "@/lib/ship-service";

export default function DashboardPage() {
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0,
  });

  const [shipStats, setShipStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [shipAuthStats, setShipAuthStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    linked: 0,
    unlinked: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [employeeData, shipData, shipAuthData] = await Promise.all([
          employeeService.getEmployeeStats(),
          shipService.getStats(),
          shipAuthService.getStats(),
        ]);
        setEmployeeStats(employeeData);
        setShipStats(shipData);
        setShipAuthStats(shipAuthData);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet & Crew Management Dashboard</h1>
          <p className="text-muted-foreground">Overview of your company's employees and fleet operations</p>
        </div>
      </div>

      {/* Employee Statistics */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Users className="h-5 w-5" />
          Employee Statistics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:grid-cols-4">
          <StatsCard
            title="Total Employees"
            icon={<Users className="h-4 w-4" />}
            value={employeeStats.total}
            description="All registered employees"
            color="default"
          />
          <StatsCard
            title="Active Employees"
            icon={<UserCheck className="h-4 w-4" />}
            value={employeeStats.active}
            description="Currently active employees"
            color="success"
          />
          <StatsCard
            title="Inactive Employees"
            icon={<UserX className="h-4 w-4" />}
            value={employeeStats.inactive}
            description="Inactive employees"
            color="destructive"
          />
          <StatsCard
            title="Departments"
            icon={<Building className="h-4 w-4" />}
            value={employeeStats.departments}
            description="Active departments"
            color="default"
          />
        </div>
      </div>

      {/* Ship Statistics */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Ship className="h-5 w-5" />
          Fleet Statistics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:grid-cols-4">
          <StatsCard
            title="Total Ships"
            icon={<Ship className="h-4 w-4" />}
            value={shipStats.total}
            description="Total fleet vessels"
            color="default"
          />
          <StatsCard
            title="Active Ships"
            icon={<Anchor className="h-4 w-4" />}
            value={shipStats.active}
            description="Currently active"
            color="success"
          />
          <StatsCard
            title="Inactive Ships"
            icon={<Wrench className="h-4 w-4" />}
            value={shipStats.inactive}
            description="Currently inactive"
            color="secondary"
          />
          <StatsCard
            title="Fleet Status"
            icon={<Ship className="h-4 w-4" />}
            value={shipStats.total > 0 ? Math.round((shipStats.active / shipStats.total) * 100) : 0}
            description="Active percentage"
            color="default"
          />
        </div>
      </div>

      {/* Ship Authentication Statistics */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Key className="h-5 w-5" />
          Ship Authentication Statistics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:grid-cols-4">
          <StatsCard
            title="Total Accounts"
            icon={<Key className="h-4 w-4" />}
            value={shipAuthStats.total}
            description="Ship email accounts"
            color="default"
          />
          <StatsCard
            title="Active Accounts"
            icon={<UserCheck className="h-4 w-4" />}
            value={shipAuthStats.active}
            description="Currently active"
            color="success"
          />
          <StatsCard
            title="Linked to Ships"
            icon={<Anchor className="h-4 w-4" />}
            value={shipAuthStats.linked}
            description="Connected to vessels"
            color="success"
          />
          <StatsCard
            title="Unlinked Accounts"
            icon={<Key className="h-4 w-4" />}
            value={shipAuthStats.unlinked}
            description="Awaiting assignment"
            color="warning"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions - Employees</CardTitle>
            <CardDescription>Common employee management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 transition-colors"
              onClick={() => (window.location.href = "/dashboard/employees/add")}
            >
              <span>Add New Employee</span>
              <Badge variant="outline">+ Add</Badge>
            </div>
            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 transition-colors"
              onClick={() => (window.location.href = "/dashboard/employees")}
            >
              <span>View All Employees</span>
              <Badge variant="outline">View</Badge>
            </div>
            <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 transition-colors">
              <span>Department Overview</span>
              <Badge variant="outline">Analyze</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions - Fleet</CardTitle>
            <CardDescription>Fleet management operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 transition-colors"
              onClick={() => (window.location.href = "/dashboard/ships/add")}
            >
              <span>Add New Ship</span>
              <Badge variant="outline">+ Add</Badge>
            </div>
            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 transition-colors"
              onClick={() => (window.location.href = "/dashboard/ships")}
            >
              <span>View Fleet Directory</span>
              <Badge variant="outline">View</Badge>
            </div>
            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-2 transition-colors"
              onClick={() => (window.location.href = "/dashboard/ships/auth")}
            >
              <span>Ship Authentication</span>
              <Badge variant="outline">Manage</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Sync</span>
              <Badge variant="outline">Just now</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  icon: React.ReactNode;
  value: number;
  description: string;
  color?: "default" | "success" | "destructive" | "warning" | "secondary";
}

function StatsCard({ title, icon, value, description, color = "default" }: StatsCardProps) {
  const colorClasses = {
    default: "text-blue-600 bg-blue-50",
    success: "text-green-600 bg-green-50",
    destructive: "text-red-600 bg-red-50",
    warning: "text-yellow-600 bg-yellow-50",
    secondary: "text-gray-600 bg-gray-50",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-md p-2 ${colorClasses[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
