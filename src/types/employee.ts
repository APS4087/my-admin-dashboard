export interface Employee {
  id: string;
  employee_number: number;
  email_address: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  department?: string;
  office_phone?: string;
  mobile_phone?: string;
  job_title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateEmployeeData {
  email_address: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  department?: string;
  office_phone?: string;
  mobile_phone?: string;
  job_title?: string;
  is_active?: boolean;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  is_active?: boolean;
}

export interface EmployeeFilters {
  department?: string;
  is_active?: boolean;
  search?: string;
}
