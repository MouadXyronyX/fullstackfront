import { useState, useEffect, useCallback } from 'react';
import { getActiveWsURL } from '../services/api';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    const socket = new WebSocket(getActiveWsURL('/ws/admin'));

    socket.onopen = () => {
      const token = localStorage.getItem('access_token');
      socket.send(JSON.stringify({ type: 'auth', token }));
    };
    socket.onerror = () => {};
    socket.onclose = () => {};

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_order' || data.type === 'new_message') {
        if (!cancelled) setUnreadCount(prev => prev + 1);
      }
    };

    setWs(socket);
    return () => {
      cancelled = true;
      socket.close();
    };
  }, []);

  const resetCount = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, resetCount };
}
