import { createClient } from '@/lib/supabase/client'
import type { Employee, CreateEmployeeData, UpdateEmployeeData, EmployeeFilters } from '@/types/employee'

export class EmployeeService {
  private supabase = createClient()

  async getAllEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    let query = this.supabase
      .from('employees')
      .select('id, employee_number, email_address, first_name, last_name, display_name, department, office_phone, mobile_phone, job_title, is_active, created_at, updated_at, created_by, updated_by')
      .order('employee_number', { ascending: true })
      .limit(100) // Limit results for better performance

    if (filters?.department) {
      query = query.eq('department', filters.department)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email_address.ilike.%${filters.search}%,job_title.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`)
    }

    return data || []
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Employee not found
      }
      throw new Error(`Failed to fetch employee: ${error.message}`)
    }

    return data
  }

  async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    const { data, error } = await this.supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create employee: ${error.message}`)
    }

    return data
  }

  async updateEmployee(id: string, employeeData: UpdateEmployeeData): Promise<Employee> {
    const { data, error } = await this.supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update employee: ${error.message}`)
    }

    return data
  }

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete employee: ${error.message}`)
    }
  }

  async getDepartments(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('department')
      .not('department', 'is', null)
      .order('department')

    if (error) {
      throw new Error(`Failed to fetch departments: ${error.message}`)
    }

    // Get unique departments
    const departments = [...new Set(data.map(item => item.department).filter(Boolean))]
    return departments
  }

  async getEmployeeStats() {
    const { data, error } = await this.supabase
      .from('employees')
      .select('is_active, department')

    if (error) {
      throw new Error(`Failed to fetch employee stats: ${error.message}`)
    }

    const total = data.length
    const active = data.filter(emp => emp.is_active).length
    const inactive = total - active
    const departments = [...new Set(data.map(emp => emp.department).filter(Boolean))].length

    return {
      total,
      active,
      inactive,
      departments
    }
  }
}

// Export a singleton instance
export const employeeService = new EmployeeService()
