import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, MessageSquare } from 'lucide-react';

const initialChats = [
  { 
    id: 1, 
    name: 'Emily Thompson', 
    avatar: '/Images/GirlImage11.png', 
    status: 'Online', 
    ticketStatus: 'Pending', 
    messages: [
      { id: 1, sender: 'user', text: 'Hello, I need help with my recent ride booking.', type: 'text' },
      { id: 2, sender: 'me', text: 'Hi Emily! Sure, I can help with that.', type: 'text' }
    ]
  },
  { id: 2, name: 'Charlotte Davis', avatar: '/Images/Girlmage5.png', status: 'Last seen 1h ago', ticketStatus: 'Resolved', messages: [
     { 
      id: 1, 
      sender: 'user', 
      text: 'The app keeps crashing whenever I try to open the map view.', 
      type: 'text', 
      time: '11:05 AM' 
    },
    { 
      id: 2, 
      sender: 'me', 
      text: 'I am sorry to hear that. Have you tried clearing your app cache or checking for updates in the store?', 
      type: 'text', 
      time: '11:10 AM' 
    }
  ] },
  { id: 3, name: 'Olivia Wilson', avatar: '/Images/Girlmage4.png', status: 'Online', ticketStatus: 'Pending', messages: [] },
  { id: 4, name: 'Sophia Martinez', avatar: '/Images/Girlmage3.png', status: 'Online', ticketStatus: 'Pending', messages: [] },
  { id: 5, name: 'Ava Anderson', avatar: '/Images/Girlmage6.png', status: 'Last seen 20m ago', ticketStatus: 'Resolved', messages: [] },
  { id: 6, name: 'Isabella Taylor', avatar: '/Images/ProfileImage.png', status: 'Online', ticketStatus: 'Pending', messages: [] },
  { id: 7, name: 'Mia White', avatar: '/Images/Girlmage8.png', status: 'Offline', ticketStatus: 'Resolved', messages: [] }
];

const SupportHelp = () => {
  const [chats, setChats] = useState(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chats, selectedChatId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;
    const newMsg = { id: Date.now(), sender: 'me' as const, text: newMessage, type: 'text' as const };
    setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, messages: [...c.messages, newMsg] } : c));
    setNewMessage('');
  };

  const toggleStatus = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setChats(prev => prev.map(c => c.id === id ? { ...c, ticketStatus: c.ticketStatus === 'Pending' ? 'Resolved' : 'Pending' } : c));
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="h-full w-full flex bg-[#111] text-white overflow-hidden rounded-2xl border border-white/5">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-white/5 flex flex-col p-4">
        <h2 className="font-bold mb-4 px-2">Messages</h2>
        <div className="relative mb-6 px-2 group">
          <Search className="absolute left-6 top-3 text-gray-500 group-hover:text-[#EB712B] transition-colors" size={16} />
          <input className="w-full bg-[#1A1A1A] rounded-xl py-3 pl-10 pr-4 border border-white/5 outline-none text-sm focus:border-[#EB712B]/50 transition-all" placeholder="Search messages..." />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 px-2 custom-scrollbar">
          {chats.map(c => (
            <div key={c.id} onClick={() => setSelectedChatId(c.id)} className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedChatId === c.id ? 'bg-[#1A1A1A] border-white/10' : 'hover:bg-[#1A1A1A]/30'}`}>
              <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-sm">{c.name}</p>
                  <button onClick={(e) => toggleStatus(e, c.id)} className={`text-[10px] px-3 py-1 rounded-full font-bold ${c.ticketStatus === 'Pending' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                    {c.ticketStatus}
                  </button>
                </div>
                <p className="text-xs text-gray-500 truncate">Click to view chat...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="w-2/3 flex flex-col bg-[#161616]">
        {selectedChat ? (
          <>
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#161616]/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <img src={selectedChat.avatar} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold">{selectedChat.name}</p>
                  <p className="text-[11px] text-gray-400  tracking-wide">{selectedChat.status}</p>
                </div>
              </div>
              <div className="flex gap-5 text-gray-400">
                <Video size={20} className="hover:text-[#EB712B] cursor-pointer" />
                <Phone size={20} className="hover:text-[#EB712B] cursor-pointer" />
                <MoreVertical size={20} className="hover:text-[#EB712B] cursor-pointer" />
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
              {selectedChat.messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 px-5 rounded-3xl max-w-[75%] ${m.sender === "me" ? "bg-[#EB712B] rounded-br-none" : "bg-[#252525] rounded-bl-none border border-white/5"}`}>
                    <p className="text-sm">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/5 bg-[#111]">
              <div className="flex items-center gap-3 bg-[#1A1A1A] p-2 rounded-2xl border border-white/5 focus-within:border-[#EB712B]/50 transition-all">
                <Paperclip className="text-gray-400 ml-2 cursor-pointer" />
                <input className="flex-1 bg-transparent p-2 outline-none text-sm" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                <Mic className="text-gray-400 cursor-pointer" />
                <button onClick={handleSendMessage} className="bg-[#EB712B] p-3 rounded-xl hover:bg-[#d66525]"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="w-28 h-28 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-8 border border-white/5">
              <MessageSquare size={50} className="text-[#EB712B]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">App Support Hub</h2>
            <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">Select a conversation to start helping your users with their app experience.</p>
            <button className="border border-[#EB712B] text-[#EB712B] px-8 py-3 rounded-xl font-bold hover:bg-[#EB712B] hover:text-white transition-all">Start New Conversation</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportHelp;