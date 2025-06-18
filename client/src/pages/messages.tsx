import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Send, Phone, Video, MoreHorizontal, 
  Search, MessageCircle, Clock, Check, CheckCheck 
} from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Link } from "wouter";

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "appointment";
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
  messages: Message[];
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: 1,
      professionalId: 1,
      professionalName: "Ana Carolina Silva",
      professionalAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
      specialization: "Fisioterapeuta",
      lastMessage: "Perfeito! Confirmo nossa sessão para amanhã às 14h.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: 1,
          senderId: 1, // User
          content: "Olá Ana! Gostaria de agendar uma sessão de fisioterapia respiratória.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 2,
          senderId: 2, // Professional
          content: "Olá! Claro, posso te ajudar. Qual seria o melhor horário para você?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 3,
          senderId: 1,
          content: "Poderia ser amanhã às 14h? Preciso de ajuda com exercícios pós-COVID.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          isRead: true,
          type: "text"
        },
        {
          id: 4,
          senderId: 2,
          content: "Perfeito! Confirmo nossa sessão para amanhã às 14h. Vou levar alguns equipamentos específicos para exercícios respiratórios.",
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          isRead: true,
          type: "text"
        }
      ]
    },
    {
      id: 2,
      professionalId: 3,
      professionalName: "João Carlos",
      professionalAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
      specialization: "Acompanhante Hospitalar",
      lastMessage: "Estarei no hospital às 8h em ponto. Qualquer dúvida, me chame.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      unreadCount: 2,
      isOnline: false,
      messages: [
        {
          id: 5,
          senderId: 1,
          content: "João, preciso de acompanhamento para minha cirurgia amanhã.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 6,
          senderId: 3,
          content: "Claro! Posso te acompanhar. Qual hospital e que horas?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 7,
          senderId: 1,
          content: "Hospital das Clínicas, às 8h da manhã. A cirurgia está marcada para as 10h.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 8,
          senderId: 3,
          content: "Estarei no hospital às 8h em ponto. Qualquer dúvida, me chame.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          isRead: false,
          type: "text"
        }
      ]
    },
    {
      id: 3,
      professionalId: 2,
      professionalName: "Maria Santos",
      professionalAvatar: "https://images.unsplash.com/photo-1594824953857-3bc2358cc3a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
      specialization: "Técnica em Enfermagem",
      lastMessage: "Obrigada! O curativo ficou perfeito.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 9,
          senderId: 2,
          content: "Olá! Como está se sentindo após o curativo de ontem?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 10,
          senderId: 1,
          content: "Muito melhor! A cicatrização está evoluindo bem.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5), // 24.5 hours ago
          isRead: true,
          type: "text"
        },
        {
          id: 11,
          senderId: 1,
          content: "Obrigada! O curativo ficou perfeito.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
          isRead: true,
          type: "text"
        }
      ]
    }
  ];

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const filteredConversations = conversations.filter(conv =>
    conv.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffMinutes < 1 ? "Agora" : `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && currentConversation) {
      // In a real app, this would send via API
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header userName="Gustavo" />
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <div className="flex-1 lg:ml-64">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white dark:bg-gray-800 border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Mensagens</h1>
                {totalUnreadCount > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {totalUnreadCount}
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4 lg:p-6 pb-20 lg:pb-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Conversations List */}
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card 
                    key={conversation.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={conversation.professionalAvatar}
                            alt={conversation.professionalName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {conversation.professionalName}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {conversation.specialization}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 truncate flex-1">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="ml-2 bg-red-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma mensagem ainda"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery 
                      ? "Tente buscar por outro termo" 
                      : "Inicie uma conversa com um profissional"
                    }
                  </p>
                  <Link href="/">
                    <Button>Encontrar Profissionais</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedConversation(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <img
              src={currentConversation?.professionalAvatar}
              alt={currentConversation?.professionalName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {currentConversation?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {currentConversation?.professionalName}
            </h2>
            <p className="text-sm text-gray-500">
              {currentConversation?.isOnline ? "Online" : "Offline"} • {currentConversation?.specialization}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" style={{ height: "calc(100vh - 140px)" }}>
        <div className="space-y-4">
          {currentConversation?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === 1
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  message.senderId === 1 ? 'justify-end' : 'justify-start'
                }`}>
                  <span className={`text-xs ${
                    message.senderId === 1 ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.senderId === 1 && (
                    <div className="text-white/70">
                      {message.isRead ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}