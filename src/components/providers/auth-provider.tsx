"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { User, authApi } from "@/lib/auth-api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require an active session
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export function AuthProvider({ 
  children, 
  initialUser = null 
}: { 
  children: React.ReactNode; 
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingRef = useRef(false);
  const redirectSentinel = useRef({ count: 0, lastTime: 0 });

  const loadUser = useCallback(async (forceLoading = true) => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    // Use a local variable or ref to track if we've successfully loaded
    // instead of relying on the closure user which could be stale.
    if (forceLoading) {
      setIsLoading(true);
    }
    
    // Safety timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setUser(null);
      isCheckingRef.current = false;
    }, 5000);

    try {
      const response = await authApi.getMe();
      if (response && response.user) {
        setUser(prev => {
          if (JSON.stringify(prev) === JSON.stringify(response.user)) return prev;
          return response.user;
        });
      } else {
        setUser(null);
      }
    } catch (err: unknown) {
      const error = err as Error;
      const isAuthError = error.message?.includes('401') || 
                          error.message?.includes('403') || 
                          error.message?.includes('User not found') ||
                          error.message?.includes('Unauthorized') ||
                          error.message?.includes('Phiên đăng nhập không hợp lệ') ||
                          error.message?.includes('Thông tin giáo xứ không hợp lệ');
      
      if (isAuthError) {
        setUser(null);
      } else {
        // Keep the existing user on network failures
        console.warn("[auth-provider] Session refresh failed, keeping current user:", error.message);
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    if (!initialUser) {
      loadUser(true);
    }
    
    const handlePopState = () => loadUser(false);
    window.addEventListener("popstate", handlePopState);
    
    const handleUnauthorized = () => {
      console.log("[auth-provider] Bắt được sự kiện 401 Unauthorized toàn cục, tiến hành ép đăng xuất.");
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [initialUser, loadUser]);

  // Centralized Redirect Logic with Redirect Sentinel
  useEffect(() => {
    if (!isMounted || isLoading) return;

    const isPrivateRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/settings');
    const isAuthRoute = PUBLIC_ROUTES.includes(pathname);

    // BREAK REDIRECT LOOP: Detect repeated redirections in short bursts
    const now = Date.now();
    if (now - redirectSentinel.current.lastTime > 5000) {
      redirectSentinel.current.count = 0;
    }

    const performRedirect = (target: string) => {
      if (pathname === target) return; // ALREADY THERE - prevent redundant history entries and requests
      
      if (redirectSentinel.current.count > 2) {
        console.error(`[auth-sentinel] Loop detected! Blocking redirect to ${target} from ${pathname}`);
        return;
      }
      
      redirectSentinel.current.count++;
      redirectSentinel.current.lastTime = now;
      console.log(`[auth] Redirecting (${redirectSentinel.current.count}/3) to ${target} from ${pathname}`);
      router.replace(target);
    };

    // ONLY redirect to dashboard if we are on an auth route (logged in already)
    // This happens primarily after successful login or bookmark access to /login
    if (user && isAuthRoute) {
      console.log("[auth] User detected on auth route, moving to dashboard");
      performRedirect('/dashboard');
    }

    // Redirect to login if on a private route without a session
    if (!user && isPrivateRoute) {
      console.log("[auth] No user on private route, moving to login");
      performRedirect('/login');
    }
  }, [user, isLoading, pathname, router, isMounted]);

  const login = useCallback((newUser: User) => setUser(newUser), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    refreshContext: () => loadUser(false),
  }), [user, isLoading, login, logout, loadUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
