export interface ParishGroupCategory {
  id: string;
  name: string;
  group_count?: number;
}

export interface ParishGroupListMember {
  id: string;
  christian_name: string | null;
  full_name: string;
}

export interface ParishGroup {
  id: string;
  name: string;
  description: string | null;
  category: ParishGroupCategory;
  leader: ParishGroupListMember | null;
  member_count: number;
  established_date: string | null;
  is_active: boolean;
  icon_url: string | null;
}

export interface ParishGroupListResponse {
  items: ParishGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats: {
    total_groups: number;
    total_members: number;
    total_categories: number;
  };
}

export interface ParishGroupDetailMember {
  id: string;
  parishioner: {
    id: string;
    christian_name: string | null;
    full_name: string;
    birth_date: string | null;
  };
  role: string | null;
  joined_at: string | null;
}

export interface ParishGroupDetail {
  id: string;
  name: string;
  description: string | null;
  category: ParishGroupCategory;
  leader: {
    id: string;
    christian_name: string | null;
    full_name: string;
    birth_date: string | null;
  } | null;
  established_date: string | null;
  is_active: boolean;
  icon_url: string | null;
  members: ParishGroupDetailMember[];
  created_at: string;
  updated_at: string;
}
