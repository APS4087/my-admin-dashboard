"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Building, Ship, Anchor, Wrench, Key } from "lucide-react";
import { employeeService } from "@/lib/employee-service";
import { shipService } from "@/lib/ship-service";
import { shipAuthService } from "@/lib/ship-auth-service";

export default function DashboardPage() {
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0
  });

  const [shipStats, setShipStats] = useState({
    total: 0,
    operational: 0,
    maintenance: 0,
    docked: 0
  });

  const [shipAuthStats, setShipAuthStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    linked: 0,
    unlinked: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [employeeData, shipData, shipAuthData] = await Promise.all([
          employeeService.getEmployeeStats(),
          shipService.getStats(),
          shipAuthService.getStats()
        ]);
        setEmployeeStats(employeeData);
        setShipStats(shipData);
        setShipAuthStats(shipAuthData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet & Crew Management Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your company's employees and fleet operations
          </p>
        </div>
      </div>

      {/* Employee Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Fleet Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Ships"
            icon={<Ship className="h-4 w-4" />}
            value={shipStats.total}
            description="Total fleet vessels"
            color="default"
          />
          <StatsCard
            title="Operational Ships"
            icon={<Anchor className="h-4 w-4" />}
            value={shipStats.operational}
            description="Currently operational"
            color="success"
          />
          <StatsCard
            title="In Maintenance"
            icon={<Wrench className="h-4 w-4" />}
            value={shipStats.maintenance}
            description="Under maintenance"
            color="warning"
          />
          <StatsCard
            title="Docked Ships"
            icon={<Ship className="h-4 w-4" />}
            value={shipStats.docked}
            description="Currently docked"
            color="secondary"
          />
        </div>
      </div>

      {/* Ship Authentication Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Ship Authentication Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions - Employees</CardTitle>
            <CardDescription>Common employee management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
              onClick={() => window.location.href = '/dashboard/employees/add'}
            >
              <span>Add New Employee</span>
              <Badge variant="outline">+ Add</Badge>
            </div>
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
              onClick={() => window.location.href = '/dashboard/employees'}
            >
              <span>View All Employees</span>
              <Badge variant="outline">View</Badge>
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded">
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
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
              onClick={() => window.location.href = '/dashboard/ships/add'}
            >
              <span>Add New Ship</span>
              <Badge variant="outline">+ Add</Badge>
            </div>
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
              onClick={() => window.location.href = '/dashboard/ships'}
            >
              <span>View Fleet Directory</span>
              <Badge variant="outline">View</Badge>
            </div>
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
              onClick={() => window.location.href = '/dashboard/ships/auth'}
            >
              <span>Ship Authentication</span>
              <Badge variant="outline">Manage</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
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
    secondary: "text-gray-600 bg-gray-50"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
