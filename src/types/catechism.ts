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
  parishioner: CertificateParishionerRef;
  certificate_type: CertificateType;
  issue_date: string;
  issued_by: string;
  certificate_no: string | null;
}

export interface CertificateDetail {
  id: string;
  parishioner: CertificateParishionerRef;
  certificate_type: CertificateType;
  issue_date: string;
  issued_by: string;
  certificate_no: string | null;
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
