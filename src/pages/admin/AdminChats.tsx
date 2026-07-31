import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePaperAirplane, HiOutlineUser, HiOutlineFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { chatsAPI } from '../../services/api';
import { Chat, Message } from '../../types';

export default function AdminChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = () => {
    setLoading(true);
    const params: any = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    chatsAPI.list(params)
      .then(res => setChats(res.data))
      .catch(() => toast.error('فشل تحميل المحادثات'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
    if (ws) ws.close();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_HOST || window.location.host;
    const socket = new WebSocket(`${protocol}//${host}/ws/chat/${chat.id}`);

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
    socket.onopen = () => {
      const token = localStorage.getItem('access_token');
      socket.send(JSON.stringify({ type: 'auth', token }));
    };
    socket.onclose = () => setConnected(false);
    setWs(socket);
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedChat) return;
    if (!connected) { toast.error('غير متصل'); return; }
    ws?.send(JSON.stringify({
      sender_type: 'admin',
      content: input.trim(),
    }));
    setMessages(prev => [...prev, {
      id: Date.now(),
      chat_id: selectedChat.id,
      sender_type: 'admin',
      content: input.trim(),
      is_read: false,
    }]);
    setInput('');
  };

  const applyDateFilter = () => {
    fetchChats();
    setShowFilter(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-arabic text-lg gold-text font-semibold">المحادثات</h2>
          <button onClick={() => setShowFilter(!showFilter)} className="text-cream/40 hover:text-gold">
            <HiOutlineFilter className="w-5 h-5" />
          </button>
        </div>

        {showFilter && (
          <div className="flex gap-2 mb-3">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field text-sm" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field text-sm" />
            <button onClick={applyDateFilter} className="gold-btn text-sm px-3 py-1">بحث</button>
          </div>
        )}

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-16rem)] lg:max-h-[calc(100vh-12rem)]">
          {loading ? (
            [1,2,3,4,5].map(i => <div key={i} className="h-16 bg-dark-800 animate-pulse rounded-lg" />)
          ) : chats.length === 0 ? (
            <p className="text-cream/40 text-center py-8">لا توجد محادثات</p>
          ) : (
            chats.map(chat => (
              <button key={chat.id} onClick={() => selectChat(chat)}
                className={`w-full text-right p-3 rounded-lg transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-gold/10 gold-border' : 'bg-dark-800 hover:bg-dark-700'
                }`}>
                <div className="flex items-center gap-2">
                  <HiOutlineUser className="w-5 h-5 text-cream/40 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-cream font-semibold truncate">
                      {chat.user?.name || chat.guest_identifier || `محادثة #${chat.id}`}
                    </p>
                    {chat.user?.email && <p className="text-xs text-cream/40 truncate">{chat.user.email}</p>}
                    {chat.user?.phone && <p className="text-xs text-cream/40 truncate" dir="ltr">{chat.user.phone}</p>}
                  </div>
                </div>
                <p className="text-xs text-cream/30 mt-1">
                  {chat.created_at ? new Date(chat.created_at).toLocaleString('ar-DZ') : ''}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-dark-800/50 rounded-xl">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-dark-700">
              <h3 className="font-arabic text-gold font-semibold">
                {selectedChat.user?.name || selectedChat.guest_identifier || `محادثة #${selectedChat.id}`}
              </h3>
              {selectedChat.user?.email && <p className="text-xs text-cream/40">{selectedChat.user.email} {selectedChat.user?.phone ? `| ${selectedChat.user.phone}` : ''}</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            <div className="border-t border-dark-700 p-4">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="اكتب رداً..." className="input-field flex-1" />
                <button onClick={sendMessage} className="gold-btn px-4" disabled={!connected}>
                  <HiOutlinePaperAirplane className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-cream/40">
            اختر محادثة من القائمة
          </div>
        )}
      </div>
    </div>
  );
}
