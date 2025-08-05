"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        // Optimistic update
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        
        await employeeService.deleteEmployee(id);
      } catch (error) {
        // Revert optimistic update on error
        fetchEmployees();
        console.error("Failed to delete employee:", error);
      }
    }
  }, [employeeService, fetchEmployees]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading employees</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchEmployees} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your company's employee records and information
          </p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                A list of all employees in your organization
                {employees.length > 0 && (
                  <span className="ml-2">
                    ({employees.length} employee{employees.length !== 1 ? 's' : ''}
                    {employees.length === 100 && ', showing first 100'})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <EmployeeTableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                        {employee.employee_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link 
                            href={`/dashboard/employees/${employee.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {employee.first_name} {employee.last_name}
                          </Link>
                          {employee.display_name && (
                            <div className="text-sm text-muted-foreground">
                              {employee.display_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{employee.email_address}</TableCell>
                      <TableCell>{employee.department || "—"}</TableCell>
                      <TableCell>{employee.job_title || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.is_active ? "default" : "secondary"}
                        >
                          {employee.is_active ? "Active" : "Inactive"}
                        </Badge>
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
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(employee.id)}
                            >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmployeesPage;