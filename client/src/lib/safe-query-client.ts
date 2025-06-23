import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function safeApiRequest(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn('API request failed silently:', error.message);
    return null;
  }
}

const safeQueryFn: QueryFunction = async ({ queryKey }) => {
  return await safeApiRequest(queryKey[0] as string);
};

export const safeQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: safeQueryFn,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});