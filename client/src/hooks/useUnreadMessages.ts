import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api-config";

export function useUnreadMessages() {
  return useQuery({
    queryKey: ["/api/messages/unread/count"],
    queryFn: async () => {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${getApiUrl()}/api/messages/unread/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar contagem de mensagens não lidas');
      }

      return response.json() as Promise<{ unreadCount: number }>;
    },
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    staleTime: 5000, // Considera os dados "frescos" por 5 segundos
  });
}

