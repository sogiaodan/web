export type SacramentType = 'BAPTISM' | 'EUCHARIST' | 'CONFIRMATION' | 'ANOINTING_OF_SICK' | 'HOLY_ORDERS' | 'MARRIAGE';

export type MarriageStatus = 'VALID' | 'ANNULLED' | 'DRAFT';

export interface MinisterRef {
  id: string;
  christian_name: string | null;
  full_name: string;
}

export interface SacramentParishionerRef {
  id: string;
  christian_name: string | null;
  full_name: string;
  birth_date: string | null;
}

export interface SacramentListItem {
  id: string;
  parishioner: SacramentParishionerRef;
  type: Omit<SacramentType, 'MARRIAGE'>;
  date: string | null;
  father_name: string | null;
  mother_name: string | null;
  godparent_name: string | null;
  minister: MinisterRef | null;
  book_no: string | null;
  page_no: string | null;
  registry_number: string | null;
}

export interface MarriageListItem {
  id: string;
  husband: Omit<SacramentParishionerRef, 'birth_date'>;
  wife: Omit<SacramentParishionerRef, 'birth_date'>;
  marriage_date: string | null;
  witness_1_name: string | null;
  witness_2_name: string | null;
  minister: MinisterRef | null;
  is_mixed_religion: boolean;
  status: MarriageStatus;
  book_no: string | null;
  page_no: string | null;
  registry_number: string | null;
}

export interface SacramentListResponse {
  items: SacramentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface MarriageListResponse {
  items: MarriageListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
