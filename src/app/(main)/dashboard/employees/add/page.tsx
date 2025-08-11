"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Upload, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { employeeService } from "@/lib/employee-service";
import type { CreateEmployeeData } from "@/types/employee";

interface ParsedEmployee {
  employee_number: number;
  email_address: string;
  first_name: string;
  last_name: string;
  display_name: string;
  department: string;
  office_phone: string;
  mobile_phone: string;
  job_title: string;
  error?: string;
}

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployee[]>([]);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Single employee form state
  const [singleEmployee, setSingleEmployee] = useState<Partial<CreateEmployeeData>>({
    email_address: "",
    first_name: "",
    last_name: "",
    display_name: "",
    department: "",
    office_phone: "",
    mobile_phone: "",
    job_title: "",
    is_active: true,
  });

  const parseBulkData = () => {
    const lines = bulkData.trim().split("\n");
    const parsed: ParsedEmployee[] = [];

    lines.forEach((line, index) => {
      const parts = line.split("\t");

      if (parts.length < 6) {
        parsed.push({
          employee_number: index + 1,
          email_address: "",
          first_name: "",
          last_name: "",
          display_name: "",
          department: "",
          office_phone: "",
          mobile_phone: "",
          job_title: "",
          error: `Invalid format - expected at least 6 columns, got ${parts.length}`,
        });
        return;
      }

      // Parse based on simplified format:
      // 1	stevenpey@trueblueshipmgt.com	Steven	Pey	Steven Pey	Management	+1234567890	+0987654321	Director
      const [
        empNum,
        email,
        firstName,
        lastName,
        displayName,
        department,
        officePhone = "",
        mobilePhone = "",
        jobTitle = "",
      ] = parts;

      parsed.push({
        employee_number: parseInt(empNum) || index + 1,
        email_address: email?.trim() || "",
        first_name: firstName?.trim() === "-" ? "" : firstName?.trim() || "",
        last_name: lastName?.trim() === "-" ? "" : lastName?.trim() || "",
        display_name: displayName?.trim() === "-" ? "" : displayName?.trim() || "",
        department: department?.trim() || "",
        office_phone: officePhone?.trim() || "",
        mobile_phone: mobilePhone?.trim() || "",
        job_title: jobTitle?.trim() || "",
      });
    });

    setParsedEmployees(parsed);
  };

  const handleBulkImport = async () => {
    setLoading(true);
    setImportResults(null);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const emp of parsedEmployees) {
      if (emp.error) {
        failed++;
        errors.push(`Row ${emp.employee_number}: ${emp.error}`);
        continue;
      }

      if (!emp.email_address || !emp.first_name) {
        failed++;
        errors.push(`Row ${emp.employee_number}: Email and first name are required`);
        continue;
      }

      try {
        await employeeService.createEmployee({
          email_address: emp.email_address,
          first_name: emp.first_name,
          last_name: emp.last_name || "",
          display_name: emp.display_name || "",
          department: emp.department || "",
          office_phone: emp.office_phone || "",
          mobile_phone: emp.mobile_phone || "",
          job_title: emp.job_title || "",
          is_active: true,
        });
        success++;
      } catch (error) {
        failed++;
        errors.push(`Row ${emp.employee_number}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    setImportResults({ success, failed, errors });
    setLoading(false);

    if (success > 0 && failed === 0) {
      setTimeout(() => {
        router.push("/dashboard/employees");
      }, 2000);
    }
  };

  const handleSingleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await employeeService.createEmployee(singleEmployee as CreateEmployeeData);
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Failed to create employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Add Employees</h1>
        <p className="text-muted-foreground">Add new employees individually or import multiple employees at once</p>
      </div>

      <Tabs defaultValue="bulk" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="single">Single Employee</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Bulk Import Employees
              </CardTitle>
              <CardDescription>
                Copy and paste employee data in tab-separated format from Excel or similar spreadsheet applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Example */}
              <div className="bg-muted/50 rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-medium">Expected Format:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border px-2 py-1 text-left">ID</th>
                        <th className="border px-2 py-1 text-left">Email</th>
                        <th className="border px-2 py-1 text-left">FirstName</th>
                        <th className="border px-2 py-1 text-left">LastName</th>
                        <th className="border px-2 py-1 text-left">DisplayName</th>
                        <th className="border px-2 py-1 text-left">Department</th>
                        <th className="border px-2 py-1 text-left">OfficePhone</th>
                        <th className="border px-2 py-1 text-left">MobilePhone</th>
                        <th className="border px-2 py-1 text-left">JobTitle</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-muted-foreground">
                        <td className="border px-2 py-1">1</td>
                        <td className="border px-2 py-1">john@company.com</td>
                        <td className="border px-2 py-1">John</td>
                        <td className="border px-2 py-1">Doe</td>
                        <td className="border px-2 py-1">John Doe</td>
                        <td className="border px-2 py-1">IT</td>
                        <td className="border px-2 py-1">+1234567890</td>
                        <td className="border px-2 py-1">+0987654321</td>
                        <td className="border px-2 py-1">Developer</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  💡 Tip: Copy data directly from Excel, Google Sheets, or any spreadsheet application
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Label htmlFor="bulkData" className="text-base font-medium">
                  Employee Data
                </Label>
                <Textarea
                  id="bulkData"
                  placeholder="Paste your employee data here... (Ctrl+V)"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="min-h-[300px] resize-none font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {bulkData.trim() ? `${bulkData.trim().split("\n").length} rows detected` : "No data entered"}
                  </p>
                  {bulkData.trim() && (
                    <Button variant="outline" size="sm" onClick={() => setBulkData("")}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button onClick={parseBulkData} disabled={!bulkData.trim()} variant="outline" className="flex-1">
                  {parsedEmployees.length > 0 ? "Re-parse Data" : "Parse Data"}
                </Button>
                {parsedEmployees.length > 0 && (
                  <Button onClick={handleBulkImport} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Importing...
                      </>
                    ) : (
                      `Import ${parsedEmployees.length} Employees`
                    )}
                  </Button>
                )}
              </div>

              {parsedEmployees.length > 0 && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                          Data Preview
                        </CardTitle>
                        <CardDescription>
                          {parsedEmployees.filter((emp) => !emp.error).length} valid employees,{" "}
                          {parsedEmployees.filter((emp) => emp.error).length} with errors
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {parsedEmployees.filter((emp) => emp.error).length > 0 && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            {parsedEmployees.filter((emp) => emp.error).length} Errors
                          </span>
                        )}
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          {parsedEmployees.filter((emp) => !emp.error).length} Ready
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] overflow-y-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-medium">#</th>
                            <th className="p-3 text-left font-medium">Email</th>
                            <th className="p-3 text-left font-medium">Name</th>
                            <th className="p-3 text-left font-medium">Department</th>
                            <th className="p-3 text-left font-medium">Job Title</th>
                            <th className="p-3 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedEmployees.map((emp, index) => (
                            <tr
                              key={index}
                              className={`hover:bg-muted/50 border-b transition-colors ${emp.error ? "bg-red-50" : ""}`}
                            >
                              <td className="p-3 font-medium">{emp.employee_number}</td>
                              <td className="p-3">
                                {emp.email_address || <span className="text-muted-foreground italic">No email</span>}
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">
                                    {emp.first_name} {emp.last_name}
                                  </div>
                                  {emp.display_name && emp.display_name !== `${emp.first_name} ${emp.last_name}` && (
                                    <div className="text-muted-foreground text-xs">({emp.display_name})</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                {emp.department || <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="p-3">
                                {emp.job_title || <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="p-3">
                                {emp.error ? (
                                  <div className="flex items-center">
                                    <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                                    <span className="text-xs font-medium text-red-600">Error</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="text-xs font-medium text-green-600">Valid</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Error Details */}
                    {parsedEmployees.some((emp) => emp.error) && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <h4 className="mb-2 flex items-center font-medium text-red-800">
                          <AlertCircle className="mr-1 h-4 w-4" />
                          Data Issues Found
                        </h4>
                        <div className="space-y-1 text-sm text-red-700">
                          {parsedEmployees
                            .filter((emp) => emp.error)
                            .map((emp, index) => (
                              <div key={index}>
                                Row {emp.employee_number}: {emp.error}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {importResults && (
                <Alert
                  className={`${importResults.failed === 0 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"} border-l-4 ${importResults.failed === 0 ? "border-l-green-500" : "border-l-orange-500"}`}
                >
                  <div className="flex items-start space-x-3">
                    {importResults.failed === 0 ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="space-y-3">
                          <div>
                            <h4
                              className={`font-semibold ${importResults.failed === 0 ? "text-green-800" : "text-orange-800"}`}
                            >
                              {importResults.failed === 0
                                ? "Import Completed Successfully!"
                                : "Import Completed with Issues"}
                            </h4>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <span className="flex items-center rounded-full bg-green-100 px-2 py-1 text-green-800">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                {importResults.success} successful
                              </span>
                              {importResults.failed > 0 && (
                                <span className="flex items-center rounded-full bg-red-100 px-2 py-1 text-red-800">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  {importResults.failed} failed
                                </span>
                              )}
                            </div>
                          </div>

                          {importResults.errors.length > 0 && (
                            <div className="rounded-lg border bg-white/80 p-3">
                              <p className="mb-2 text-sm font-medium">Error Details:</p>
                              <div className="max-h-32 space-y-1 overflow-y-auto">
                                {importResults.errors.map((error, index) => (
                                  <div key={index} className="rounded bg-red-50 px-2 py-1 text-sm text-red-700">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {importResults.success > 0 && importResults.failed === 0 && (
                            <p className="text-sm text-green-700">
                              🎉 All employees have been successfully added! Redirecting to employee list...
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Add Single Employee
              </CardTitle>
              <CardDescription>Enter employee information manually</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={singleEmployee.email_address}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, email_address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={singleEmployee.first_name}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={singleEmployee.last_name}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={singleEmployee.display_name}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, display_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={singleEmployee.department}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="officePhone">Office Phone</Label>
                    <Input
                      id="officePhone"
                      value={singleEmployee.office_phone}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, office_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobilePhone">Mobile Phone</Label>
                    <Input
                      id="mobilePhone"
                      value={singleEmployee.mobile_phone}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, mobile_phone: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={singleEmployee.job_title}
                      onChange={(e) => setSingleEmployee((prev) => ({ ...prev, job_title: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Employee"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
