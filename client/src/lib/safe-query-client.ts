import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function safeApiRequest(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(fullUrl, {
      method: 'GET',
      ...options,
      headers,
      signal: controller.signal,
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return null;
      }
      return null; // Return null for any HTTP error instead of throwing
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Silently handle all fetch errors
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