import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  MapPin,
  Star,
  Image as ImageIcon,
  File,
  Camera,
  Mic,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  professionalId: number;
  professionalName: string;
  professionalAvatar: string;
  specialization: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  rating?: number;
  location?: string;
  messages: Message[];
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for conversations
  const mockConversations: Conversation[] = [
    {
      id: 1,
      professionalId: 1,
      professionalName: "Ana Carolina Silva",
      professionalAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      specialization: "Fisioterapeuta",
      lastMessage: "Ótimo! Nos vemos na próxima sessão então.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 2,
      isOnline: true,
      rating: 4.9,
      location: "São Paulo, SP",
      messages: [
        {
          id: 1,
          senderId: 1,
          content: "Olá! Como você está se sentindo após nossa última sessão?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isRead: true,
          type: "text"
        },
        {
          id: 2,
          senderId: user?.id || 2,
          content: "Muito melhor! As dores nas costas diminuíram bastante.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isRead: true,
          type: "text"
        },
        {
          id: 3,
          senderId: 1,
          content: "Que bom! Vamos continuar com os exercícios. Você conseguiu fazer em casa?",
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          isRead: true,
          type: "text"
        },
        {
          id: 4,
          senderId: user?.id || 2,
          content: "Sim, fiz todos os dias como você recomendou.",
          timestamp: new Date(Date.now() - 1000 * 60 * 40),
          isRead: true,
          type: "text"
        },
        {
          id: 5,
          senderId: 1,
          content: "Perfeito! Vamos agendar nossa próxima sessão para sexta-feira às 14h?",
          timestamp: new Date(Date.now() - 1000 * 60 * 35),
          isRead: true,
          type: "text"
        },
        {
          id: 6,
          senderId: user?.id || 2,
          content: "Pode ser! Confirmo o agendamento.",
          timestamp: new Date(Date.now() - 1000 * 60 * 32),
          isRead: true,
          type: "text"
        },
        {
          id: 7,
          senderId: 1,
          content: "Ótimo! Nos vemos na próxima sessão então.",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: false,
          type: "text"
        }
      ]
    },
    {
      id: 2,
      professionalId: 2,
      professionalName: "Dr. João Santos",
      professionalAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
      specialization: "Técnico em Enfermagem",
      lastMessage: "Medicação aplicada com sucesso. Próxima dose às 18h.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
      unreadCount: 0,
      isOnline: false,
      rating: 4.8,
      location: "Rio de Janeiro, RJ",
      messages: [
        {
          id: 8,
          senderId: 2,
          content: "Bom dia! Cheguei para aplicar a medicação.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          isRead: true,
          type: "text"
        },
        {
          id: 9,
          senderId: user?.id || 2,
          content: "Perfeito! Estou te esperando.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
          isRead: true,
          type: "text"
        },
        {
          id: 10,
          senderId: 2,
          content: "Medicação aplicada com sucesso. Próxima dose às 18h.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          isRead: true,
          type: "text"
        }
      ]
    },
    {
      id: 3,
      professionalId: 3,
      professionalName: "Maria Oliveira",
      professionalAvatar: "https://images.unsplash.com/photo-1594824911330-75490d35b1bb?w=300&h=300&fit=crop&crop=face",
      specialization: "Acompanhante Hospitalar",
      lastMessage: "Paciente descansando bem. Sinais vitais normais.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 6),
      unreadCount: 1,
      isOnline: true,
      rating: 5.0,
      location: "Belo Horizonte, MG",
      messages: [
        {
          id: 11,
          senderId: 3,
          content: "Boa tarde! Iniciei o acompanhamento do seu pai.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
          isRead: true,
          type: "text"
        },
        {
          id: 12,
          senderId: user?.id || 2,
          content: "Obrigado! Como ele está?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
          isRead: true,
          type: "text"
        },
        {
          id: 13,
          senderId: 3,
          content: "Paciente descansando bem. Sinais vitais normais.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          isRead: false,
          type: "text"
        }
      ]
    }
  ];

  const [conversations] = useState<Conversation[]>(mockConversations);

  const filteredConversations = conversations.filter(conv =>
    conv.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConv?.messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR');
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await apiRequest('POST', '/api/messages', {
        recipientId: selectedConv?.professionalId,
        content: newMessage,
        type: 'text'
      });

      if (response.ok) {
        setNewMessage("");
        // In a real app, you would refetch messages or use websockets
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
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

  const scheduleAppointment = () => {
    toast({
      title: "Agendamento",
      description: "Redirecionando para agendar consulta...",
    });
  };

  const makeCall = () => {
    toast({
      title: "Chamada",
      description: "Iniciando chamada de voz...",
    });
  };

  const makeVideoCall = () => {
    toast({
      title: "Videochamada",
      description: "Iniciando videochamada...",
    });
  };

  if (!selectedConversation) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Conversations List */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mensagens</h1>
            </div>
            
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
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.professionalAvatar} alt={conversation.professionalName} />
                      <AvatarFallback>{conversation.professionalName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.professionalName}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {conversation.specialization}
                      </Badge>
                      {conversation.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {conversation.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-yellow-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {conversation.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Selecione uma conversa
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Escolha uma conversa para começar a trocar mensagens
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Conversations List - Hidden on mobile when conversation is selected */}
      <div className="hidden lg:block w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mensagens</h1>
          </div>
          
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

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                conversation.id === selectedConversation ? 'bg-yellow-50 dark:bg-yellow-900/20 border-r-2 border-r-yellow-500' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.professionalAvatar} alt={conversation.professionalName} />
                    <AvatarFallback>{conversation.professionalName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.professionalName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {conversation.specialization}
                    </Badge>
                    {conversation.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {conversation.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-yellow-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConv?.professionalAvatar} alt={selectedConv?.professionalName} />
                  <AvatarFallback>{selectedConv?.professionalName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {selectedConv?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
              
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {selectedConv?.professionalName}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedConv?.specialization}
                  </p>
                  {selectedConv?.isOnline && (
                    <span className="text-xs text-green-600 dark:text-green-400">online</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={makeCall}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={makeVideoCall}>
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={scheduleAppointment}>
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConv?.messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : ''}`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {selectedConv?.professionalName}
                      </span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwn 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {isOwn && (
                      <div className="text-gray-500 dark:text-gray-400">
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
    </div>
  );
}