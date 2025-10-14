import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./api-config";

async function safeApiRequest(url: string): Promise<any> {
  const baseUrl = getApiUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const token = sessionStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
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

export { safeApiRequest as apiRequest };