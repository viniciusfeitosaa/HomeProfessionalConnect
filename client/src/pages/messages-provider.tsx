import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Search, Paperclip, Smile, Check, CheckCheck, Calendar, MapPin, Star, Camera, MessageSquare, UserIcon, Home, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-config";
import { useLocation, useRoute } from "wouter";
import ProviderNavbar from "../components/provider-navbar";

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "appointment" | "file";
  attachmentUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: number;
  clientId: number;
  clientName: string;
  clientAvatar: string;
  specialization: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  rating?: number;
  location?: string;
  messages: Message[];
}

export default function MessagesProvider({ params }: { params?: { conversationId?: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const [match, paramsRoute] = useRoute("/messages-provider/:conversationId");
  const conversationId = params?.conversationId || null;

  // Buscar conversas da API
  const fetchConversations = async () => {
    try {
      console.log('🔄 fetchConversations - Iniciando busca de conversas...');
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ Token não encontrado');
        toast({
          title: "Erro de autenticação",
          description: "Faça login para acessar as mensagens",
          variant: "destructive",
        });
        return;
      }
      const response = await fetch(`${getApiUrl()}/api/messages`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Dados recebidos do backend:', data);
        setConversations(data);
        console.log('✅ Conversas atualizadas no estado:', data.length, 'conversas');
      } else if (response.status === 401) {
        console.log('❌ Erro 401 - Sessão expirada');
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive",
        });
      } else {
        console.log('❌ Erro na resposta:', response.status);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível carregar as conversas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log('❌ Erro na busca de conversas:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🔄 fetchConversations - Finalizado');
    }
  };

  // Buscar mensagens ao abrir conversa
  const fetchMessages = async (conversationId: string | number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/api/messages/${conversationId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      // erro silencioso
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Buscar mensagens ao abrir conversa
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    console.log('Mensagens carregadas do backend:', messages);
  }, [messages]);

  const filteredConversations = conversations.filter(conv =>
    conv.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // filteredConversations updated

  const selectedConv = conversations.find(c => String(c.id) === String(conversationId));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString('pt-BR');
  };

  const formatMessageTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Faça login para enviar mensagens",
        variant: "destructive",
      });
      return;
    }
    try {
      const newMsg: Message = {
        id: Date.now(),
        senderId: user?.id || 0,
        content: newMessage,
        timestamp: new Date(),
        isRead: false,
        type: "text",
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      const response = await fetch(`${getApiUrl()}/api/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedConv.clientId,
          conversationId: Number(conversationId),
          content: newMessage,
          type: 'text'
        }),
      });
      if (!response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== newMsg.id));
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem",
          variant: "destructive",
        });
      } else {
        // Buscar mensagens atualizadas do backend
        if (conversationId) {
          fetchMessages(conversationId);
        }
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Navegar para a conversa ao clicar
  const handleConversationClick = (id: number) => {
    setLocation(`/messages-provider/${id}`);
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      console.log('🗑️ Tentando excluir conversa:', conversationId);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/api/messages/conversation/${conversationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        console.log('✅ Conversa excluída com sucesso, recarregando lista...');
        toast({ title: 'Conversa excluída', description: 'A conversa foi removida com sucesso.' });
        await fetchConversations(); // Aguardar a conclusão
        console.log('✅ Lista de conversas recarregada');
      } else {
        console.log('❌ Erro ao excluir conversa:', response.status);
        toast({ title: 'Erro', description: 'Não foi possível excluir a conversa', variant: 'destructive' });
      }
    } catch (error) {
      console.log('❌ Erro ao excluir conversa:', error);
      toast({ title: 'Erro', description: 'Erro ao excluir conversa', variant: 'destructive' });
    }
  };

  // Se não houver conversationId, mostrar lista de conversas
  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Mensagens</h1>
          </div>
        </div>
        {/* Conversations List */}
        <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">Carregando conversas...</p>
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma conversa encontrada
                  </h3>
                  <p className="text-gray-500">
                    Você ainda não tem conversas ativas
                  </p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={conversation.clientAvatar} alt={conversation.clientName} />
                        <AvatarFallback className="bg-yellow-500 text-white text-xs sm:text-sm">
                          {conversation.clientName?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {conversation.clientName}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0 bg-yellow-100 text-yellow-800">
                          {conversation.specialization}
                        </Badge>
                        {conversation.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">
                              {conversation.rating}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm text-gray-600 truncate flex-1 min-w-0">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-yellow-500 text-white text-xs min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center flex-shrink-0">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conversation.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">
                            {conversation.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-full hover:bg-red-100 text-red-600 flex-shrink-0"
                    title="Excluir conversa"
                    onClick={e => { e.stopPropagation(); deleteConversation(conversation.id); }}
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <ProviderNavbar />
      </div>
    );
  }

  // Se houver conversationId, mostrar o chat da conversa
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 pb-24 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/messages')}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Mensagens</h1>
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setLocation('/messages')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConv?.clientAvatar} alt={selectedConv?.clientName} />
                  <AvatarFallback className="bg-yellow-500 text-white">
                    {selectedConv?.clientName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {selectedConv?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {selectedConv?.clientName}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    {selectedConv?.specialization}
                  </p>
                  {selectedConv?.isOnline && (
                    <span className="text-xs text-green-600">online</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
          {messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : ''}`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {selectedConv?.clientName}
                      </span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwn 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {isOwn && (
                      <div className="text-gray-500">
                        {message.isRead ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Camera className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <ProviderNavbar />
    </div>
  );
} 