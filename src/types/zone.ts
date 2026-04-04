export interface ParishionerLookup {
  id: string;
  christian_name: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  birth_date?: string;
  household_name?: string;
  household_code?: string;
}

export interface ZoneStats {
  total_parishioners: number;
  total_households: number;
}

export interface Zone {
  id: string;
  name: string;
  head?: ParishionerLookup;
  total_parishioners?: number;
  total_households?: number;
}

export interface ZoneDetail extends Zone {
  description?: string;
  patron_saint?: string;
  feast_day?: string;
  stats?: ZoneStats;
  parishioners?: {
    items: ParishionerLookup[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    }
  }
}

export interface ZoneListResponse {
  items: Zone[];
  stats: {
    total_zones: number;
    total_zone_members: number;
  };
}

export interface CreateZoneDto {
  name: string;
  head_id?: string;
  description?: string;
}

export interface UpdateZoneDto extends Partial<CreateZoneDto> {}
