import { Send, Search, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Sidebar } from "@/components/sidebar";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Professional } from "@shared/schema";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
  senderAvatar: string;
}

interface Conversation {
  id: number;
  professionalId: number;
  professionalName: string;
  professionalAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

export default function Messages() {
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for conversations
  const conversations: Conversation[] = [
    {
      id: 1,
      professionalId: 1,
      professionalName: "Pedro Afonso",
      professionalAvatar: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      lastMessage: "Oi! Posso chegar um pouco mais cedo hoje, tudo bem?",
      lastMessageTime: new Date("2025-06-14T14:30:00"),
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      professionalId: 2,
      professionalName: "Lucas Abreu",
      professionalAvatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      lastMessage: "Obrigado pela avaliação! Foi um prazer atendê-lo.",
      lastMessageTime: new Date("2025-06-13T16:45:00"),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 3,
      professionalId: 3,
      professionalName: "Marcos Silva",
      professionalAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      lastMessage: "Material chegou! Posso iniciar o serviço amanhã cedo.",
      lastMessageTime: new Date("2025-06-12T09:15:00"),
      unreadCount: 1,
      isOnline: true
    }
  ];

  // Mock messages data
  const conversationMessages: Message[] = [
    {
      id: 1,
      senderId: 1,
      receiverId: 1,
      content: "Oi! Tudo bem? Preciso de um orçamento para instalação de ar-condicionado.",
      timestamp: new Date("2025-06-14T14:00:00"),
      isRead: true,
      senderName: "Você",
      senderAvatar: ""
    },
    {
      id: 2,
      senderId: 2,
      receiverId: 1,
      content: "Olá! Claro, posso sim. Qual o ambiente que vai ser instalado?",
      timestamp: new Date("2025-06-14T14:05:00"),
      isRead: true,
      senderName: "Pedro Afonso",
      senderAvatar: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
    },
    {
      id: 3,
      senderId: 1,
      receiverId: 2,
      content: "É para a sala, aproximadamente 20m². Você tem horário livre amanhã?",
      timestamp: new Date("2025-06-14T14:10:00"),
      isRead: true,
      senderName: "Você",
      senderAvatar: ""
    },
    {
      id: 4,
      senderId: 2,
      receiverId: 1,
      content: "Oi! Posso chegar um pouco mais cedo hoje, tudo bem?",
      timestamp: new Date("2025-06-14T14:30:00"),
      isRead: false,
      senderName: "Pedro Afonso",
      senderAvatar: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
    }
  ];

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const filteredConversations = conversations.filter(conv =>
    conv.professionalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleCall = () => {
    console.log("Starting call with", selectedConv?.professionalName);
  };

  const handleVideoCall = () => {
    console.log("Starting video call with", selectedConv?.professionalName);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? "agora" : `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }
  };

  // Chat view
  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 min-h-screen relative flex flex-col bg-white lg:bg-transparent">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-200 lg:rounded-t-lg lg:mt-4 lg:mx-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="mr-2 p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={selectedConv?.professionalAvatar} />
                  <AvatarFallback>{selectedConv?.professionalName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConv?.professionalName}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedConv?.isOnline ? "Online" : "Visto por último hoje"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCall}>
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleVideoCall}>
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 lg:bg-white lg:mx-4">
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderName === "Você" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderName === "Você"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderName === "Você" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 lg:rounded-b-lg lg:mx-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 rounded-full border-gray-300"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="rounded-full p-2 h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <BottomNavigation />
          </div>
        </div>
      </div>
    );
  }

  // Conversations list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 min-h-screen relative">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-2 p-2 lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mensagens</h1>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-0"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="space-y-2 mb-20">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma conversa encontrada</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.professionalAvatar} />
                            <AvatarFallback>
                              {conversation.professionalName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.professionalName}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className={`text-sm truncate ${
                            conversation.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-600"
                          }`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            <BottomNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}