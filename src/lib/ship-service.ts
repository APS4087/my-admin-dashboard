import { createClient } from '@/lib/supabase/client'
import type { Ship, CreateShipData, UpdateShipData, ShipFilters } from '@/types/ship'

export class ShipService {
  private supabase = createClient()

  async getAllShips(filters?: ShipFilters): Promise<Ship[]> {
    // Select only needed fields for better performance
    let query = this.supabase
      .from('ships')
      .select('id, ship_email, ship_password, app_password, is_active, created_at, updated_at, created_by, updated_by')
      .order('created_at', { ascending: false })
      .limit(100) // Limit results for better performance

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.ilike('ship_email', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch ships: ${error.message}`)
    }

    return data || []
  }

  async getShipById(id: string): Promise<Ship | null> {
    const { data, error } = await this.supabase
      .from('ships')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Ship not found
      }
      throw new Error(`Failed to fetch ship: ${error.message}`)
    }

    return data
  }

  async createShip(shipData: CreateShipData): Promise<Ship> {
    const { data, error } = await this.supabase
      .from('ships')
      .insert([shipData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create ship: ${error.message}`)
    }

    return data
  }

  async updateShip(id: string, shipData: UpdateShipData): Promise<Ship> {
    const { data, error } = await this.supabase
      .from('ships')
      .update(shipData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update ship: ${error.message}`)
    }

    return data
  }

  async deleteShip(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ships')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ship: ${error.message}`)
    }
  }

  async getStats() {
    const { data, error } = await this.supabase
      .from('ships')
      .select('is_active')

    if (error) {
      throw new Error(`Failed to fetch ship stats: ${error.message}`)
    }

    const total = data.length
    const active = data.filter(ship => ship.is_active).length
    const inactive = total - active

    return {
      total,
      active,
      inactive,
    }
  }
}

export const shipService = new ShipService()
