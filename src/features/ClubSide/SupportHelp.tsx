import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, MessageSquare } from 'lucide-react';

const initialChats = [
  { 
    id: 1, 
    name: 'Emily Thompson', 
    avatar: '/Images/GirlImage11.png', 
    status: 'Online', 
    ticketStatus: 'Resolved', 
    unreadCount: 1, // Orange circle badge with "1"
    messages: [
      { id: 1, sender: 'user', text: 'Hello, I need help with my recent ride booking.', type: 'text' },
      { id: 2, sender: 'me', text: 'Hi Emily! Sure, I can help with that.', type: 'text' }
    ]
  },
  { 
    id: 2, 
    name: 'Charlotte Davis', 
    avatar: '/Images/Girlmage5.png', 
    status: 'Last seen 1h ago', 
    ticketStatus: 'Resolved', 
    unreadCount: 2, // Orange circle badge with "2"
    messages: [
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
    ] 
  },
  { id: 3, name: 'Olivia Wilson', avatar: '/Images/Girlmage4.png', status: 'Online', ticketStatus: 'Pending', unreadCount: 0, messages: [] },
  { id: 4, name: 'Sophia Martinez', avatar: '/Images/Girlmage3.png', status: 'Online', ticketStatus: 'Pending', unreadCount: 0, messages: [] },
  { id: 5, name: 'Ava Anderson', avatar: '/Images/Girlmage6.png', status: 'Last seen 20m ago', ticketStatus: 'Pending', unreadCount: 0, messages: [] },
  { id: 6, name: 'Isabella Taylor', avatar: '/Images/ProfileImage.png', status: 'Online', ticketStatus: 'Pending', unreadCount: 0, messages: [] },
  { id: 7, name: 'Mia White', avatar: '/Images/Girlmage8.png', status: 'Offline', ticketStatus: 'Pending', unreadCount: 0, messages: [] }
];

interface SupportHelpProps {
  role?: 'organizer' | 'athlete';
}

const SupportHelp: React.FC<SupportHelpProps> = ({ role = 'organizer' }) => {
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
    <div className="h-full w-full flex text-white overflow-hidden rounded-2xl border border-white/10 bg-[#161616]">
      {/* Sidebar / Inbox - Expanded width */}
      <div className="w-[380px] min-w-[380px] border-r border-white/5 flex flex-col p-6 bg-[#111111]">
        <h2 className="font-bold text-base mb-4 px-2">Messages</h2>
        <div className="relative mb-4 px-2 group">
          <Search className="absolute left-6 top-3.5 text-gray-500 group-hover:text-[#EB712B] transition-colors" size={18} />
          <input className="w-full bg-[#1A1A1A] rounded-xl py-4 pl-12 pr-4 border border-white/5 outline-none text-xs focus:border-[#EB712B]/50 transition-all" placeholder="Search messages..." />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 px-2 custom-scrollbar">
          {chats.map(c => (
            <div key={c.id} onClick={() => setSelectedChatId(c.id)} className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${selectedChatId === c.id ? 'bg-[#1A1A1A] border-white/10' : 'hover:bg-[#1A1A1A]/30'}`}>
              <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="font-bold text-xs">{c.name}</p>
                  
                  {/* Athlete unread badge style (Changed from green to #EB712B orange circle with counter) */}
                  {role === 'athlete' ? (
                    c.unreadCount > 0 ? (
                      <div className="bg-[#EB712B] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">
                        {c.unreadCount}
                      </div>
                    ) : null
                  ) : (
                    /* Owner/Organizer status toggle badge */
                    <button 
                      onClick={(e) => toggleStatus(e, c.id)} 
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${c.ticketStatus === 'Pending' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}
                    >
                      {c.ticketStatus}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate">View chat...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-[#161616] overflow-hidden">
        {selectedChat ? (
          <>
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#161616]">
              <div className="flex items-center gap-4">
                <img src={selectedChat.avatar} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
                <div>
                  <p className="font-bold text-sm">{role === 'athlete' ? 'Customer Support Team' : selectedChat.name}</p>
                  <p className="text-[11px] text-[#EB712B] tracking-wide font-medium mt-0.5">{role === 'athlete' ? 'Always here to help' : selectedChat.status}</p>
                </div>
              </div>
              <div className="flex gap-6 text-gray-400">
                <Video size={22} className="hover:text-[#EB712B] cursor-pointer transition-colors" />
                <Phone size={22} className="hover:text-[#EB712B] cursor-pointer transition-colors" />
                <MoreVertical size={22} className="hover:text-[#EB712B] cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 px-8 py-6 overflow-y-auto space-y-6 bg-[#161616]">
              {selectedChat.messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 px-6 rounded-2xl max-w-[75%] ${m.sender === "me" ? "bg-[#EB712B] text-white rounded-br-none" : "bg-[#252525] text-white rounded-bl-none border border-white/5 shadow-lg"}`}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-8 py-6 border-t border-white/5 bg-[#161616]">
              <div className="flex items-center gap-4 bg-[#1A1A1A] px-6 py-4 rounded-2xl border border-white/5 focus-within:border-[#EB712B]/50 transition-all">
                <Paperclip className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={20} />
                <input className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500" placeholder={role === 'athlete' ? "Ask support a question..." : "Type a message..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                <Mic className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={20} />
                <button onClick={handleSendMessage} className="bg-[#EB712B] p-3.5 rounded-xl hover:bg-[#d66525] transition-all text-white"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="w-28 h-28 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-8 border border-white/5">
              <MessageSquare size={50} className="text-[#EB712B]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Customer Support</h2>
            <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">Select a conversation from the sidebar to start messaging or helping out.</p>
            <button className="border border-[#EB712B] text-[#EB712B] px-8 py-3 rounded-xl font-bold hover:bg-[#EB712B] hover:text-white transition-all">Open Session</button>
          </div>
        )}
      </div>
    </div>
  );
};

export const OrganizerSupport = () => <SupportHelp role="organizer" />;
export const AthleteSupport = () => <SupportHelp role="athlete" />;

export default SupportHelp;