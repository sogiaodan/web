"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SystemAdmin, SystemAdminGetMeResponse } from "@/types/system-admin";
import { systemAdminApi } from "@/lib/system-admin-api";
import { useRouter, usePathname } from "next/navigation";

interface SystemAdminContextType {
  admin: SystemAdmin | null;
  isLoading: boolean;
  login: (admin: SystemAdmin) => void;
  logout: () => Promise<void>;
  refreshContext: () => Promise<void>;
}

const SystemAdminContext = createContext<SystemAdminContextType | undefined>(undefined);

export function SystemAdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<SystemAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadAdmin = async () => {
    // Only attempt to load admin if we are on a super-admin route
    if (!pathname.startsWith('/super-admin')) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await systemAdminApi.getMe();
      if (response && response.user) {
        setAdmin(response.user);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      setAdmin(null);
      // Only redirect to login if we are trying to access protected admin pages
      if (pathname.startsWith('/super-admin/dashboard')) {
        router.push('/super-admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [pathname]);

  const login = (newAdmin: SystemAdmin) => {
    setAdmin(newAdmin);
  };

  const logout = async () => {
    try {
      await systemAdminApi.logout();
    } catch (err) {
      // Ignore API errors on logout
    } finally {
      setAdmin(null);
      router.push("/super-admin/login");
    }
  };

  return (
    <SystemAdminContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        refreshContext: loadAdmin,
      }}
    >
      {children}
    </SystemAdminContext.Provider>
  );
}

export function useSystemAdmin() {
  const context = useContext(SystemAdminContext);
  if (context === undefined) {
    throw new Error("useSystemAdmin must be used within a SystemAdminProvider");
  }
  return context;
}
