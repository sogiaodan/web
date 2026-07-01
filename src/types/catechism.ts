export type CertificateType = 'RCIA' | 'MARRIAGE_PREP';

export interface CertificateParishionerRef {
  id: string;
  christian_name: string | null;
  full_name: string;
  birth_date: string | null;
  parish_name: string | null;
}

export interface CertificateListItem {
  id: string;
  parishioner: CertificateParishionerRef | null;
  is_outsider: boolean;
  outsider_christian_name: string | null;
  outsider_name: string | null;
  outsider_birth_date: string | null;
  outsider_gender: string | null;
  outsider_parish_name: string | null;
  certificate_type: CertificateType;
  issue_date: string;
  issued_by: string;
  certificate_no: string | null;
}

export interface CertificateDetail {
  id: string;
  parishioner: CertificateParishionerRef | null;
  is_outsider: boolean;
  outsider_christian_name: string | null;
  outsider_name: string | null;
  outsider_birth_date: string | null;
  outsider_gender: string | null;
  outsider_parish_name: string | null;
  certificate_type: CertificateType;
  issue_date: string;
  issued_by: string;
  certificate_no: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}


export interface CertificatePagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface CertificateListResponse {
  items: CertificateListItem[];
  pagination: CertificatePagination;
}
