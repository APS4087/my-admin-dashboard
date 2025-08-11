"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Mail, Phone, Briefcase, Building, Calendar, User, Key, MapPin } from "lucide-react";
import { employeeService } from "@/lib/employee-service";
import type { Employee } from "@/types/employee";
import Link from "next/link";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!params.id || typeof params.id !== "string") return;

      try {
        const data = await employeeService.getEmployeeById(params.id);
        setEmployee(data);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id]);

  const handleDelete = async () => {
    if (!employee) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await employeeService.deleteEmployee(employee.id);
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Failed to delete employee:", error);
      alert("Failed to delete employee. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-20 rounded bg-gray-200"></div>
            <div className="h-8 w-64 rounded bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 rounded-lg bg-gray-200"></div>
              <div className="h-32 rounded-lg bg-gray-200"></div>
            </div>
            <div className="h-64 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold">Employee Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The employee you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/dashboard/employees">
                <Button>Return to Employee List</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-muted-foreground">Employee #{employee.employee_number}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">First Name</label>
                  <p className="text-base">{employee.first_name}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Last Name</label>
                  <p className="text-base">{employee.last_name || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-muted-foreground text-sm font-medium">Display Name</label>
                  <p className="text-base">{employee.display_name || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-base">{employee.email_address}</p>
                    <a href={`mailto:${employee.email_address}`}>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Office Phone</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-base">{employee.office_phone || "—"}</p>
                    {employee.office_phone && (
                      <a href={`tel:${employee.office_phone}`}>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Mobile Phone</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-base">{employee.mobile_phone || "—"}</p>
                    {employee.mobile_phone && (
                      <a href={`tel:${employee.mobile_phone}`}>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Department</label>
                  <div className="flex items-center space-x-2">
                    <Building className="text-muted-foreground h-4 w-4" />
                    <p className="text-base">{employee.department || "—"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Job Title</label>
                  <p className="text-base">{employee.job_title || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={employee.is_active ? "default" : "secondary"}>
                  {employee.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span className="font-mono">#{employee.employee_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(employee.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(employee.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button className="w-full" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Information
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
