"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeService } from "@/lib/employee-service";
import type { Employee } from "@/types/employee";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

// Enhanced loading skeleton for table
function EmployeeTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee #</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Job Title</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-8 w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use useMemo to ensure service is only created once
  const employeeService = useMemo(() => new EmployeeService(), []);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await employeeService.getAllEmployees({
        search: debouncedSearchTerm || undefined,
      });
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employees");
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, employeeService]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this employee?")) {
        try {
          // Optimistic update
          setEmployees((prev) => prev.filter((emp) => emp.id !== id));

          await employeeService.deleteEmployee(id);
        } catch (error) {
          // Revert optimistic update on error
          fetchEmployees();
          console.error("Failed to delete employee:", error);
        }
      }
    },
    [employeeService, fetchEmployees],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              <p className="font-medium">Error loading employees</p>
              <p className="text-muted-foreground mt-1 text-sm">{error}</p>
              <Button onClick={fetchEmployees} variant="outline" size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your company's employee records and information</p>
        </div>
        <Link href="/dashboard/employees/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                A list of all employees in your organization
                {employees.length > 0 && (
                  <span className="ml-2">
                    ({employees.length} employee{employees.length !== 1 ? "s" : ""}
                    {employees.length === 100 && ", showing first 100"})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:w-[300px] lg:w-[350px] xl:w-[400px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="overflow-x-auto">
              <EmployeeTableSkeleton />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Employee #</TableHead>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[250px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Department</TableHead>
                    <TableHead className="min-w-[180px]">Job Title</TableHead>
                    <TableHead className="min-w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center">
                        <div className="text-muted-foreground">
                          {searchTerm ? (
                            <>
                              No employees found matching "{searchTerm}".{" "}
                              <Button variant="link" className="p-0" onClick={() => setSearchTerm("")}>
                                Clear search
                              </Button>
                            </>
                          ) : (
                            <>
                              No employees found.{" "}
                              <Link href="/dashboard/employees/add">
                                <Button variant="link" className="p-0">
                                  Add your first employee
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          <span className="whitespace-nowrap">{employee.employee_number}</span>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/employees/${employee.id}`}
                              className="hover:text-primary block truncate font-medium transition-colors"
                            >
                              {employee.first_name} {employee.last_name}
                            </Link>
                            {employee.display_name && (
                              <div className="text-muted-foreground truncate text-sm">{employee.display_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="block truncate">{employee.email_address}</span>
                        </TableCell>
                        <TableCell>
                          <span className="block truncate">{employee.department || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="block truncate">{employee.job_title || "—"}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/employees/${employee.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(employee.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmployeesPage;
