import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2, HiOutlinePaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import IslamicDivider from '../../components/ui/IslamicDivider';
import { useAuth } from '../../context/AuthContext';
import { chatsAPI, getActiveWsURL } from '../../services/api';
import { Chat, Message } from '../../types';

export default function ChatPage() {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [initError, setInitError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Require login for new chats
  useEffect(() => {
    if (!chatId && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [chatId, isAuthenticated, navigate]);

  // Get or create chat
  useEffect(() => {
    let cancelled = false;

    const initChat = async () => {
      try {
        setInitError('');
        let chatData: Chat;

        if (chatId) {
          const res = await chatsAPI.get(parseInt(chatId));
          chatData = res.data;
        } else if (isAuthenticated && user) {
          const res = await chatsAPI.create({ product_id: productId ? parseInt(productId) : undefined });
          chatData = res.data;
        } else {
          return;
        }

        if (cancelled) return;

        setChat(chatData);
        setMessages(chatData.messages || []);
      } catch {
        if (!cancelled) setInitError('تعذر تحميل الدردشة. حاول مرة أخرى.');
      }
    };
    initChat();

    return () => { cancelled = true; };
  }, [chatId, isAuthenticated, user, productId]);

  // WebSocket connection
  useEffect(() => {
    if (!chat) return () => {};

    const socket = new WebSocket(getActiveWsURL(`/ws/chat/${chat.id}`));

    socket.onopen = () => {
      const token = localStorage.getItem('access_token');
      socket.send(JSON.stringify({ type: 'auth', token }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ready') {
        setConnected(true);
      } else if (data.type === 'message') {
        setMessages(prev => [...prev, {
          id: data.id,
          chat_id: data.chat_id,
          sender_type: data.sender_type,
          content: data.content,
          is_read: false,
          created_at: data.created_at,
        }]);
      }
    };

    socket.onerror = () => {
      setConnected(false);
      toast.error('فشل الاتصال بالدردشة المباشرة');
    };

    socket.onclose = () => {
      setConnected(false);
    };

    setWs(socket);

    return () => {
      socket.close();
      setWs(null);
      setConnected(false);
    };
  }, [chat]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!ws || !connected) {
      toast.error('الدردشة غير متصلة');
      return;
    }
    ws.send(JSON.stringify({
      sender_type: 'customer',
      content: input.trim(),
    }));
    setInput('');
  };

  return (
    <div className="pt-28 max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-arabic font-bold gold-text text-center mb-2">تواصل معنا</h1>
      <IslamicDivider />

      {initError && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-center text-red-300">
          {initError}
          <button onClick={() => window.location.reload()} className="mr-3 underline text-gold">إعادة المحاولة</button>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mt-8 flex flex-col h-[60vh]">
        {/* Connection status */}
        <div className="px-4 pt-3 flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-cream/50">{connected ? 'متصل' : 'غير متصل'}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !initError && (
            <div className="text-center text-cream/40 py-12">
              <HiOutlineChatAlt2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ابدأ المحادثة معنا...</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${
                msg.sender_type === 'customer'
                  ? 'bg-dark-700 text-cream'
                  : 'bg-gold/20 text-gold border border-gold/20'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-[10px] mt-1 opacity-50">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('ar-DZ') : ''}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-dark-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="اكتب رسالتك..."
              className="input-field flex-1"
              disabled={!connected}
            />
            <button onClick={sendMessage} className="gold-btn px-4" disabled={!connected}>
              <HiOutlinePaperAirplane className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
