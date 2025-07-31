export interface Ship {
  id: string;
  ship_email: string;
  ship_password: string;
  app_password: string;
  is_active: boolean;
  vesselfinder_url?: string; // URL to VesselFinder page for this specific ship
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateShipData {
  ship_email: string;
  ship_password: string;
  app_password: string;
  is_active?: boolean;
  vesselfinder_url?: string;
}

export interface UpdateShipData extends Partial<CreateShipData> {
  vesselfinder_url?: string;
}

export interface ShipFilters {
  is_active?: boolean;
  search?: string;
}
