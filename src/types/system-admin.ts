export interface SystemAdmin {
  id: string;
  name: string;
  email: string;
  role: 'SYSTEM_ADMIN';
}

export interface ChurchOnboardingRequest {
  name: string;
  schema_name: string;
  admin_name: string;
  admin_email: string;
  admin_password?: string;
}

export interface ChurchOnboardingResponse {
  message: string;
  church: {
    id: string;
    name: string;
    schema_name: string;
  };
  admin_email: string;
}

export interface SystemAdminLoginResponse {
  access_token: string;
  user: SystemAdmin;
}

export interface SystemAdminGetMeResponse {
  user: SystemAdmin;
}
