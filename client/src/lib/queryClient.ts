import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Em desenvolvimento, use o proxy do Vite mantendo URLs relativas
  const baseUrl = import.meta.env.VITE_API_URL || 'https://lifebee-backend.onrender.com';
  const fullUrl = import.meta.env.DEV
    ? url
    : (url.startsWith('http') ? url : `${baseUrl}${url}`);

  let res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Fallback no dev: se 404 no proxy, tentar direto no backend (VITE_API_URL)
  if (import.meta.env.DEV && res.status === 404 && url.startsWith('/api')) {
    const fallbackBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const fallbackUrl = `${fallbackBase}${url}`;
    res = await fetch(fallbackUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  }

  // Handle 401 errors by clearing token
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    return res;
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://lifebee-backend.onrender.com';
      const url = queryKey[0] as string;
      const fullUrl = import.meta.env.DEV
        ? url
        : (url.startsWith('http') ? url : `${baseUrl}${url}`);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let res = await fetch(fullUrl, {
        headers,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Fallback no dev: se 404 no proxy, tentar direto no backend (VITE_API_URL)
      if (import.meta.env.DEV && res.status === 404 && url.startsWith('/api')) {
        const fallbackBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const fallbackUrl = `${fallbackBase}${url}`;
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 10000);
        res = await fetch(fallbackUrl, {
          headers,
          credentials: "include",
          signal: controller2.signal,
        });
        clearTimeout(timeoutId2);
      }

      if (unauthorizedBehavior === "returnNull" && (res.status === 401 || res.status === 403)) {
        return null;
      }

      if (!res.ok) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      
      return await res.json();
    } catch (error: any) {
      console.warn('API request failed:', error.message);
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // For network errors, return null instead of throwing
      if (error.name === 'AbortError' || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return null;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
      retryOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});
