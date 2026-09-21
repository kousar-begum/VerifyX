export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
  isNetworkError?: boolean;
}

export const getApiBaseUrl = (): string => {
  return (
    localStorage.getItem('verifyx_api_url') ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
};

export const getApiPrefix = (): string => {
  return (
    localStorage.getItem('verifyx_api_prefix') ||
    import.meta.env.VITE_API_PREFIX ||
    '/api'
  );
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('verifyx_auth_token');
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const apiPrefix = getApiPrefix();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Form primary target URL with /api prefix if not already present in baseUrl or endpoint
  let url: string;
  if (baseUrl.endsWith('/api')) {
    url = `${baseUrl}${cleanEndpoint.replace(/^\/api/, '')}`;
  } else if (cleanEndpoint.startsWith(apiPrefix) || cleanEndpoint.startsWith('/api')) {
    url = `${baseUrl}${cleanEndpoint}`;
  } else {
    url = `${baseUrl}${apiPrefix}${cleanEndpoint}`;
  }

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if body is FormData (browser automatically sets multipart boundary)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If 404 with /api prefix, fallback to direct path without /api prefix
    if (response.status === 404 && url.includes(apiPrefix)) {
      const fallbackUrl = `${baseUrl}${cleanEndpoint.replace(/^\/api/, '')}`;
      try {
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          headers,
        });
        if (fallbackRes.ok) {
          response = fallbackRes;
        }
      } catch {
        // preserve original response
      }
    }

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const error: ApiError = {
        message:
          errorData?.detail ||
          errorData?.message ||
          `Request failed with status ${response.status}`,
        statusCode: response.status,
        details: errorData,
      };
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }
    const networkError: ApiError = {
      message: `Unable to reach FastAPI backend at ${baseUrl}. Please check that the server is running.`,
      isNetworkError: true,
      details: err,
    };
    throw networkError;
  }
}
