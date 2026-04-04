// ─── Enums ────────────────────────────────────────────────────────────────────

export type ParishionerStatus = 'RESIDING' | 'ABSENT' | 'TRANSFERRED' | 'DECEASED';
export type ParishionerGender = 'MALE' | 'FEMALE';
export type SacramentType = 'BAPTISM' | 'EUCHARIST' | 'CONFIRMATION' | 'ANOINTING_OF_SICK' | 'HOLY_ORDERS';
export type MaritalStatus = 'SINGLE' | 'MARRIED';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface ParishionerListItem {
  id: string;
  christian_name: string;
  full_name: string;
  birth_date: string;
  gender: ParishionerGender;
  zone_name: string;
  household_code: string;
  status: ParishionerStatus;
  is_deceased: boolean;
  is_non_catholic: boolean;
}

export interface ParishionerSummaryRef {
  id: string;
  christian_name: string;
  full_name: string;
  birth_date?: string;
  gender?: ParishionerGender;
}

export interface SacramentEntry {
  id: string;
  type: SacramentType;
  date: string | null;
  place: string | null;
  minister_name: string | null;
  godparent_name: string | null;
  certificate_url: string | null;
}

export interface GenealogyNode {
  id: string;
  christian_name: string | null;
  full_name: string;
  role: 'PATERNAL_GRANDFATHER' | 'PATERNAL_GRANDMOTHER' | 'FATHER' | 'MOTHER';
  generation: number;
}

export interface MarriageInfo {
  id: string;
  spouse: ParishionerSummaryRef;
  marriage_date: string;
}

// ─── Detail Response ──────────────────────────────────────────────────────────

export interface ParishionerDetail {
  id: string;
  christian_name: string;
  full_name: string;
  nick_name: string | null;
  gender: ParishionerGender;
  birth_date: string;
  is_deceased: boolean;
  is_non_catholic: boolean;
  date_of_death: string | null;
  occupation: string | null;
  phone_number: string | null;
  status: ParishionerStatus;
  marital_status: MaritalStatus;
  household: { id: string; household_code: string } | null;
  zone: { id: string; name: string } | null;
  father: ParishionerSummaryRef | null;
  mother: ParishionerSummaryRef | null;
  siblings: ParishionerSummaryRef[];
  genealogy: GenealogyNode[];
  sacraments: SacramentEntry[];
  marriage: MarriageInfo | null;
}

// ─── Preview Response ─────────────────────────────────────────────────────────

export interface ParishionerPreviewSacrament {
  type: SacramentType;
  date: string | null;
  place: string | null;
  minister_name: string | null;
  godparent_name: string | null;
}

export interface ParishionerPreview {
  id: string;
  christian_name: string;
  full_name: string;
  status: ParishionerStatus;
  birth_date: string;
  gender: ParishionerGender;
  birth_place: string | null;
  zone_name: string;
  sacraments: ParishionerPreviewSacrament[];
}

// ─── List Response ────────────────────────────────────────────────────────────

export interface ParishionerListStats {
  total_parishioners: number;
  male_count: number;
  female_count: number;
  residence_rate: number;
  new_this_month: number;
}

export interface ParishionerListResponse {
  items: ParishionerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats: ParishionerListStats;
}

// ─── Typeahead Lookup ─────────────────────────────────────────────────────────

export interface ParishionerLookup {
  id: string;
  christian_name: string;
  full_name: string;
  birth_date: string;
}
