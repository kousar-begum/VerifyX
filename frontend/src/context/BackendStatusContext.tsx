import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { testSupabaseConnection, SUPABASE_URL } from '../services/supabaseClient';

interface BackendStatusContextType {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  isConnected: boolean | null; // null = checking, true = online, false = offline
  isChecking: boolean;
  lastChecked: Date | null;
  checkConnection: () => Promise<boolean>;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  serverDiagnostics: {
    status?: string;
    version?: string;
    latencyMs?: number;
    endpoint?: string;
  } | null;
  supabaseStatus: {
    connected: boolean | null;
    message?: string;
    latencyMs?: number;
    url?: string;
  };
  checkSupabase: () => Promise<void>;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(() => {
    return localStorage.getItem('verifyx_api_url') || DEFAULT_API_URL;
  });

  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    return localStorage.getItem('verifyx_auth_token');
  });

  const [userEmail, setUserEmailState] = useState<string | null>(() => {
    return localStorage.getItem('verifyx_user_email');
  });

  const [userName, setUserNameState] = useState<string | null>(() => {
    return localStorage.getItem('verifyx_user_name');
  });

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [serverDiagnostics, setServerDiagnostics] = useState<{
    status?: string;
    version?: string;
    latencyMs?: number;
    endpoint?: string;
  } | null>(null);

  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean | null;
    message?: string;
    latencyMs?: number;
    url?: string;
  }>({
    connected: null,
    url: SUPABASE_URL,
  });

  const checkSupabase = useCallback(async () => {
    try {
      const res = await testSupabaseConnection();
      setSupabaseStatus({
        connected: res.connected,
        message: res.message,
        latencyMs: res.latencyMs,
        url: SUPABASE_URL,
      });
    } catch {
      setSupabaseStatus({
        connected: false,
        message: 'Could not reach Supabase endpoint',
        url: SUPABASE_URL,
      });
    }
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    const cleanBase = apiBaseUrl.replace(/\/$/, '');
    const startTime = performance.now();

    // Check endpoints in order: /health, /api/health, /api, /docs
    const endpointsToTry = ['/health', '/api/health', '/api', '/docs'];

    for (const ep of endpointsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${cleanBase}${ep}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/html',
          },
        });
        clearTimeout(timeoutId);

        if (response.ok || response.status === 401) {
          const latency = Math.round(performance.now() - startTime);
          let data = {};
          try {
            data = await response.json();
          } catch {
            // non-json response
          }

          setIsConnected(true);
          setServerDiagnostics({
            status: 'online',
            latencyMs: latency,
            endpoint: ep,
            ...(data as object),
          });
          setLastChecked(new Date());
          setIsChecking(false);
          return true;
        }
      } catch {
        // Try next candidate endpoint
      }
    }

    // Unreachable
    setIsConnected(false);
    setServerDiagnostics(null);
    setLastChecked(new Date());
    setIsChecking(false);
    return false;
  }, [apiBaseUrl]);

  useEffect(() => {
    checkConnection();
    checkSupabase();
  }, [checkConnection, checkSupabase]);

  const setApiBaseUrl = (url: string) => {
    const cleanUrl = url.trim();
    setApiBaseUrlState(cleanUrl);
    localStorage.setItem('verifyx_api_url', cleanUrl);
    setTimeout(() => {
      checkConnection();
    }, 100);
  };

  const setUserEmail = (email: string | null) => {
    setUserEmailState(email);
    if (email) {
      localStorage.setItem('verifyx_user_email', email);
    } else {
      localStorage.removeItem('verifyx_user_email');
    }
  };

  const setUserName = (name: string | null) => {
    setUserNameState(name);
    if (name) {
      localStorage.setItem('verifyx_user_name', name);
    } else {
      localStorage.removeItem('verifyx_user_name');
    }
  };

  const setAuthToken = (token: string | null) => {
    setAuthTokenState(token);
    if (token) {
      localStorage.setItem('verifyx_auth_token', token);
    } else {
      localStorage.removeItem('verifyx_auth_token');
      localStorage.removeItem('verifyx_user_email');
      localStorage.removeItem('verifyx_user_name');
      setUserEmailState(null);
      setUserNameState(null);
    }
  };

  return (
    <BackendStatusContext.Provider
      value={{
        apiBaseUrl,
        setApiBaseUrl,
        isConnected,
        isChecking,
        lastChecked,
        checkConnection,
        authToken,
        setAuthToken,
        userEmail,
        setUserEmail,
        userName,
        setUserName,
        serverDiagnostics,
        supabaseStatus,
        checkSupabase,
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = (): BackendStatusContextType => {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error('useBackendStatus must be used within a BackendStatusProvider');
  }
  return context;
};
