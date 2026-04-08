export interface ParishionerSummary {
  id: string;
  christian_name: string;
  full_name: string;
  gender?: 'MALE' | 'FEMALE';
  birth_date?: string;
  avatar_url?: string;
  baptism_date?: string;
  marriage_date?: string;
  parishioner_code?: string;
  relationship?: string;
  status?: string;
  relationship_to_head?: string;
  marital_status?: string;
  phone_number?: string;
}

export interface SplitMemberSummary {
  id: string;
  christian_name: string;
  full_name: string;
  relationship: string;
  split_date: string;
  new_household_code: string;
  new_household_id: string;
  gender?: 'MALE' | 'FEMALE';
  avatar_url?: string;
}

export interface Household {
  id: string;
  household_code: string;
  address: string;
  household_status: 'ACTIVE' | 'MOVED_OUT' | 'DISSOLVED';
  member_count?: number;
  zone_name?: string;
  zone_id?: string;
  phone_number?: string;
  physical_book_no?: string;
  book_issue_date?: string;
  pastoral_notes?: string;
  zone?: { id: string; name: string };
  head?: ParishionerSummary;
  spouse?: ParishionerSummary;
  current_members?: ParishionerSummary[];
  split_members?: SplitMemberSummary[];
}

export interface HouseholdListResponse {
  items: Household[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats: {
    total_households: number;
    total_members: number;
    total_zones: number;
  };
}

export interface Zone {
  id: string;
  name: string;
}

export interface HouseholdStats {
  total_households: number;
  total_members: number;
  total_zones: number;
}
