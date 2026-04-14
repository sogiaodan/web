"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { SystemAdmin } from "@/types/system-admin";
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
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingRef = useRef(false);
  const redirectSentinel = useRef({ count: 0, lastTime: 0 });

  const loadAdmin = useCallback(async () => {
    if (isCheckingRef.current) return;
    
    // Only attempt to load admin if we are on a super-admin route
    if (!pathname.startsWith('/super-admin')) {
      setIsLoading(false);
      return;
    }

    isCheckingRef.current = true;
    setIsLoading(true);
    
    // Safety timeout: 5 seconds to prevent permanent white-screen/loading-hang
    const timeout = setTimeout(() => {
      if (!admin) {
        setIsLoading(false);
        setAdmin(null);
      }
      isCheckingRef.current = false;
    }, 5000);

    try {
      const response = await systemAdminApi.getMe();
      if (response && response.user) {
        setAdmin(response.user);
      } else {
        setAdmin(null);
      }
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      const isAuthError = 
        error.status === 401 ||
        error.message?.includes('401') || 
        error.message?.includes('403') || 
        error.message?.includes('not found') ||
        error.message?.includes('Unauthorized') ||
        error.message?.includes('không hợp lệ');
      
      if (isAuthError) {
        setAdmin(null);
        // Clear the stale cookie via backend then hard-redirect.
        // This ensures the browser does NOT re-send the invalid token on next load.
        if (typeof window !== 'undefined' && pathname.startsWith('/super-admin/dashboard')) {
          try { await systemAdminApi.logout(); } catch { /* ignore */ }
          window.location.href = '/super-admin/login';
          return;
        }
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, [admin, pathname]);

  useEffect(() => {
    setIsMounted(true);
    loadAdmin();
    
    const handlesysAdminUnauthorized = async () => {
      console.log("[system-admin-provider] Bắt được sự kiện 401 Unauthorized, tiến hành ép đăng xuất.");
      setAdmin(null);
      setIsLoading(false);
      // Call logout to clear the cookie on the server, then hard-redirect
      try { await systemAdminApi.logout(); } catch { /* ignore */ }
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/super-admin/dashboard')) {
        window.location.href = '/super-admin/login';
      }
    };
    window.addEventListener("sysadmin:unauthorized", handlesysAdminUnauthorized);
    
    return () => {
      window.removeEventListener("sysadmin:unauthorized", handlesysAdminUnauthorized);
    };
  }, [pathname, loadAdmin]);

  // Centralized Redirect Logic for System Admin
  useEffect(() => {
    if (!isMounted || isLoading) return;

    const isDashboardRoute = pathname.startsWith('/super-admin/dashboard');
    const isLoginRoute = pathname === '/super-admin/login';

    // BREAK REDIRECT LOOP
    const now = Date.now();
    if (now - redirectSentinel.current.lastTime > 5000) {
      redirectSentinel.current.count = 0;
    }

    const performRedirect = (target: string) => {
      if (pathname === target) return; 
      
      if (redirectSentinel.current.count > 2) {
        console.error(`[system-admin-sentinel] Loop detected! Blocking redirect to ${target}`);
        return;
      }
      
      redirectSentinel.current.count++;
      redirectSentinel.current.lastTime = now;
      router.replace(target);
    };

    if (admin && isLoginRoute) {
      performRedirect('/super-admin/dashboard');
    }

    if (!admin && isDashboardRoute) {
      // Use hard redirect so stale React state is fully wiped on next page load
      window.location.href = '/super-admin/login';
    }
  }, [admin, isLoading, pathname, router, isMounted]);

  const login = (newAdmin: SystemAdmin) => {
    setAdmin(newAdmin);
  };

  const logout = async () => {
    try {
      await systemAdminApi.logout();
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
