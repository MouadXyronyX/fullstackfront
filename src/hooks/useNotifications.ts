import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_HOST || window.location.host;
    const socket = new WebSocket(`${protocol}//${host}/ws/admin`);

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
