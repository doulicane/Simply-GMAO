/**
 * =============================================================================
 * useNotifications — Hook WebSocket pour notifications temps reel
 * =============================================================================
 * Connecte au namespace /notifications de Socket.IO. Maintient un état local
 * des notifications non lues. Se reconnecte automatiquement.
 * =============================================================================
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { API_URL } from '@/lib/config';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export function useNotifications() {
  const token = useAuthStore((s) => s.accessToken);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const connect = useCallback(() => {
    if (!token || socketRef.current?.connected) return;

    const wsUrl = API_URL.startsWith('http')
      ? API_URL.replace('/api', '')
      : `${window.location.protocol}//${window.location.host}`;
    const socket = io(`${wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('notification:new', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on('preventive:alert', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on('workorder:completed', (data: { id: string; numero: string; equipmentId?: string; status: string }) => {
      const notif: Notification = {
        id: `wo-completed-${data.id}`,
        type: 'success',
        title: 'BT terminé — Reprise production',
        message: `Le BT ${data.numero} est ${data.status === 'CLOTURE' ? 'clôturé' : 'terminé'}. Confirmez la reprise de production.`,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/bons-de-travail/${data.id}`,
      };
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on('notification:list', (list: Notification[]) => {
      setNotifications(list);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [token]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const markAsRead = useCallback((id: string) => {
    socketRef.current?.emit('notification:read', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    socketRef.current?.emit('notification:readAll');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
