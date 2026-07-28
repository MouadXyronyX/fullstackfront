import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePaperAirplane, HiOutlineChatAlt2 } from 'react-icons/hi';
import { chatsAPI } from '../../services/api';
import { Chat, Message } from '../../types';

export default function AdminChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    chatsAPI.list().then(res => setChats(res.data)).catch(() => {});
  }, []);



  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);

    // Connect WebSocket
    if (ws) ws.close();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_HOST || window.location.host;
    const socket = new WebSocket(`${protocol}//${host}/ws/chat/${chat.id}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
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
    setWs(socket);
  };

  const sendMessage = () => {
    if (!input.trim() || !ws) return;
    ws.send(JSON.stringify({
      sender_type: 'admin',
      content: input.trim(),
    }));
    setInput('');
  };

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">المحادثات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat List */}
        <div className="lg:col-span-1 card">
          <div className="p-3 border-b border-dark-700">
            <h2 className="font-arabic text-sm text-gold font-semibold">المحادثات النشطة</h2>
          </div>
          <div className="divide-y divide-dark-700 max-h-[60vh] overflow-y-auto">
            {chats.length === 0 && (
              <div className="p-6 text-center text-cream/40 text-sm">لا توجد محادثات نشطة</div>
            )}
            {chats.map(chat => (
              <button key={chat.id} onClick={() => selectChat(chat)}
                className={`w-full text-right p-3 hover:bg-dark-700/50 transition-colors ${selectedChat?.id === chat.id ? 'bg-dark-700' : ''}`}>
                <p className="text-sm text-cream/80 font-medium">
                  {chat.guest_identifier ? `زائر (${chat.guest_identifier.slice(0, 8)}...)` : chat.user?.name || 'زبون'}
                </p>
                <p className="text-xs text-cream/40 mt-1">
                  {chat.product_id ? `حول المنتج #${chat.product_id}` : 'محادثة عامة'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 card flex flex-col h-[65vh]">
          {selectedChat ? (
            <>
              <div className="p-3 border-b border-dark-700">
                <p className="text-sm text-gold font-semibold">
                  {selectedChat.guest_identifier ? `زائر (${selectedChat.guest_identifier.slice(0, 8)}...)` : 'محادثة'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-3 rounded-xl ${
                      msg.sender_type === 'admin'
                        ? 'bg-gold/20 text-gold border border-gold/20'
                        : 'bg-dark-700 text-cream'
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

              <div className="border-t border-dark-700 p-3">
                <div className="flex gap-2">
                  <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب رداً..." className="input-field flex-1" />
                  <button onClick={sendMessage} className="gold-btn px-4"><HiOutlinePaperAirplane className="w-5 h-5" /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-cream/40">
              <div className="text-center">
                <HiOutlineChatAlt2 className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="font-arabic">اختر محادثة للرد عليها</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
