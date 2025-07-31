export interface ShipAuth {
  id: string;
  ship_id?: string;
  ship_email: string;
  ship_password: string;
  app_password: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateShipAuthData {
  ship_id?: string;
  ship_email: string;
  ship_password: string;
  app_password: string;
  is_active?: boolean;
}

export interface UpdateShipAuthData extends Partial<CreateShipAuthData> {
  id?: string;
}

export interface ShipAuthFilters {
  is_active?: boolean;
  search?: string;
}
