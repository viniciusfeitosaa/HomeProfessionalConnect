import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/api-config';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  data?: {
    scheduledDate?: string;
    scheduledTime?: string;
    numberOfDays?: number;
    dailyRate?: string;
    startDate?: string;
    endDate?: string;
    paymentAmount?: string;
  };
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount: number;
}

export function NotificationDropdown({ isOpen, onClose, notificationCount }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${getApiUrl()}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${getApiUrl()}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(229, 231, 235, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #eab308, #fbbf24);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ca8a04, #eab308);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #eab308 rgba(229, 231, 235, 0.5);
        }
        .dark .custom-scrollbar {
          scrollbar-color: #eab308 rgba(55, 65, 81, 0.5);
        }
      `}</style>
      <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-transparent backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/20 dark:border-gray-700/20 z-50">
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações
          </h3>
          <div className="flex items-center gap-2">
            {notificationCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 text-center bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg m-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg m-2">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors backdrop-blur-sm ${
                  notification.read 
                    ? 'bg-white/20 dark:bg-gray-700/20' 
                    : 'bg-yellow-50/30 dark:bg-yellow-900/30 border-l-4 border-yellow-500'
                } hover:bg-white/30 dark:hover:bg-gray-600/30 mb-2`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        notification.read 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {notification.title}
                      </h4>
                    </div>
                    <p className={`text-xs mt-1 ${
                      notification.read 
                        ? 'text-gray-600 dark:text-gray-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {/* Informações de Data (se disponíveis) */}
                    {notification.data && (notification.data.startDate || notification.data.numberOfDays) && (
                      <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          <div className="flex flex-col gap-0.5">
                            {notification.data.startDate && notification.data.endDate && (
                              <span className="text-blue-700 dark:text-blue-300 font-medium">
                                {new Date(notification.data.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} 
                                {' até '}
                                {new Date(notification.data.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </span>
                            )}
                            {notification.data.numberOfDays && notification.data.numberOfDays > 1 && (
                              <span className="text-blue-600 dark:text-blue-400 text-[10px]">
                                {notification.data.numberOfDays} {notification.data.numberOfDays === 1 ? 'dia' : 'dias'}
                                {notification.data.scheduledTime && ` • ${notification.data.scheduledTime}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
    // Atualizar contador a cada 30 segundos
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/notifications/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.count || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar contador de notificações:', error);
    }
  };

  return (
    <div className="relative">
      <div 
        className="bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-primary transition-colors" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </div>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notificationCount={notificationCount}
      />
    </div>
  );
}
