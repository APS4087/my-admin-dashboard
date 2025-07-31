import { createClient } from '@/lib/supabase/client'
import type { ShipAuth, CreateShipAuthData, UpdateShipAuthData, ShipAuthFilters } from '@/types/ship-auth'

export class ShipAuthService {
  private supabase = createClient()

  async getAllShipAuth(filters?: ShipAuthFilters): Promise<ShipAuth[]> {
    let query = this.supabase
      .from('ship_auth')
      .select(`
        *,
        ships!ship_auth_ship_id_fkey (
          ship_name,
          ship_type,
          current_port
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(`ship_email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch ship authentication: ${error.message}`)
    }

    return data || []
  }

  async getShipAuthById(id: string): Promise<ShipAuth | null> {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .select(`
        *,
        ships!ship_auth_ship_id_fkey (
          ship_name,
          ship_type,
          current_port
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Ship auth not found
      }
      throw new Error(`Failed to fetch ship authentication: ${error.message}`)
    }

    return data
  }

  async getShipAuthByEmail(email: string): Promise<ShipAuth | null> {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .select('*')
      .eq('ship_email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Ship auth not found
      }
      throw new Error(`Failed to fetch ship authentication: ${error.message}`)
    }

    return data
  }

  async createShipAuth(authData: CreateShipAuthData): Promise<ShipAuth> {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .insert([authData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create ship authentication: ${error.message}`)
    }

    return data
  }

  async updateShipAuth(id: string, authData: UpdateShipAuthData): Promise<ShipAuth> {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .update(authData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update ship authentication: ${error.message}`)
    }

    return data
  }

  async deleteShipAuth(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ship_auth')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ship authentication: ${error.message}`)
    }
  }

  async linkToShip(authId: string, shipId: string): Promise<ShipAuth> {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .update({ ship_id: shipId })
      .eq('id', authId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to link ship authentication: ${error.message}`)
    }

    return data
  }

  async unlinkFromShip(authId: string): Promise<ShipAuth> {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .update({ ship_id: null })
      .eq('id', authId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to unlink ship authentication: ${error.message}`)
    }

    return data
  }

  async getStats() {
    const { data, error } = await this.supabase
      .from('ship_auth')
      .select('is_active, ship_id')

    if (error) {
      throw new Error(`Failed to fetch ship auth stats: ${error.message}`)
    }

    const total = data.length
    const active = data.filter(auth => auth.is_active).length
    const inactive = total - active
    const linked = data.filter(auth => auth.ship_id).length
    const unlinked = total - linked

    return {
      total,
      active,
      inactive,
      linked,
      unlinked
    }
  }
}

// Export a singleton instance
export const shipAuthService = new ShipAuthService()
