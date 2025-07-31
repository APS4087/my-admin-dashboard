"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
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
    const lines = bulkData.trim().split('\n');
    const parsed: ParsedEmployee[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('\t');
      
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
          error: `Invalid format - expected at least 6 columns, got ${parts.length}`
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
        jobTitle = ""
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
        errors.push(`Row ${emp.employee_number}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setImportResults({ success, failed, errors });
    setLoading(false);

    if (success > 0 && failed === 0) {
      setTimeout(() => {
        router.push('/dashboard/employees');
      }, 2000);
    }
  };

  const handleSingleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await employeeService.createEmployee(singleEmployee as CreateEmployeeData);
      router.push('/dashboard/employees');
    } catch (error) {
      console.error('Failed to create employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Employees</h1>
        <p className="text-muted-foreground">
          Add new employees individually or import multiple employees at once
        </p>
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
              <div className="bg-muted/50 border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm">Expected Format:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
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
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Copy data directly from Excel, Google Sheets, or any spreadsheet application
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Label htmlFor="bulkData" className="text-base font-medium">Employee Data</Label>
                <Textarea
                  id="bulkData"
                  placeholder="Paste your employee data here... (Ctrl+V)"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {bulkData.trim() ? `${bulkData.trim().split('\n').length} rows detected` : 'No data entered'}
                  </p>
                  {bulkData.trim() && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBulkData('')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  onClick={parseBulkData}
                  disabled={!bulkData.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {parsedEmployees.length > 0 ? 'Re-parse Data' : 'Parse Data'}
                </Button>
                {parsedEmployees.length > 0 && (
                  <Button
                    onClick={handleBulkImport}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                        <CardTitle className="text-lg flex items-center">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                          Data Preview
                        </CardTitle>
                        <CardDescription>
                          {parsedEmployees.filter(emp => !emp.error).length} valid employees, {parsedEmployees.filter(emp => emp.error).length} with errors
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {parsedEmployees.filter(emp => emp.error).length > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            {parsedEmployees.filter(emp => emp.error).length} Errors
                          </span>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {parsedEmployees.filter(emp => !emp.error).length} Ready
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left p-3 font-medium">#</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Name</th>
                            <th className="text-left p-3 font-medium">Department</th>
                            <th className="text-left p-3 font-medium">Job Title</th>
                            <th className="text-left p-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedEmployees.map((emp, index) => (
                            <tr key={index} className={`border-b transition-colors hover:bg-muted/50 ${emp.error ? 'bg-red-50' : ''}`}>
                              <td className="p-3 font-medium">{emp.employee_number}</td>
                              <td className="p-3">{emp.email_address || <span className="text-muted-foreground italic">No email</span>}</td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                                  {emp.display_name && emp.display_name !== `${emp.first_name} ${emp.last_name}` && (
                                    <div className="text-xs text-muted-foreground">({emp.display_name})</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">{emp.department || <span className="text-muted-foreground">—</span>}</td>
                              <td className="p-3">{emp.job_title || <span className="text-muted-foreground">—</span>}</td>
                              <td className="p-3">
                                {emp.error ? (
                                  <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-600 text-xs font-medium">Error</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-green-600 text-xs font-medium">Valid</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Error Details */}
                    {parsedEmployees.some(emp => emp.error) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Data Issues Found
                        </h4>
                        <div className="space-y-1 text-sm text-red-700">
                          {parsedEmployees
                            .filter(emp => emp.error)
                            .map((emp, index) => (
                              <div key={index}>Row {emp.employee_number}: {emp.error}</div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {importResults && (
                <Alert className={`${importResults.failed === 0 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"} border-l-4 ${importResults.failed === 0 ? "border-l-green-500" : "border-l-orange-500"}`}>
                  <div className="flex items-start space-x-3">
                    {importResults.failed === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="space-y-3">
                          <div>
                            <h4 className={`font-semibold ${importResults.failed === 0 ? "text-green-800" : "text-orange-800"}`}>
                              {importResults.failed === 0 ? "Import Completed Successfully!" : "Import Completed with Issues"}
                            </h4>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {importResults.success} successful
                              </span>
                              {importResults.failed > 0 && (
                                <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {importResults.failed} failed
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {importResults.errors.length > 0 && (
                            <div className="bg-white/80 border rounded-lg p-3">
                              <p className="font-medium text-sm mb-2">Error Details:</p>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {importResults.errors.map((error, index) => (
                                  <div key={index} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
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
              <CardDescription>
                Enter employee information manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={singleEmployee.email_address}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, email_address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={singleEmployee.first_name}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={singleEmployee.last_name}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={singleEmployee.display_name}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, display_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={singleEmployee.department}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="officePhone">Office Phone</Label>
                    <Input
                      id="officePhone"
                      value={singleEmployee.office_phone}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, office_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobilePhone">Mobile Phone</Label>
                    <Input
                      id="mobilePhone"
                      value={singleEmployee.mobile_phone}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, mobile_phone: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={singleEmployee.job_title}
                      onChange={(e) => setSingleEmployee(prev => ({ ...prev, job_title: e.target.value }))}
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
