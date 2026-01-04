'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, ReactNode } from 'react';
import {
  Menu, Search, ArrowLeft, Phone, MoreVertical, Paperclip,
  Smile, Send, Mic, Check, CheckCheck, ChevronDown, X,
  Archive, Trash2, VolumeX, CheckCircle, Settings, Users,
  Bookmark, CircleHelp, UserPlus, LogOut, Pin, Reply,
  Image as ImageIcon, Moon, Sun, StopCircle, Info, Forward,
  Camera, Bell, Lock, Edit2, Edit3, Megaphone, Ban, Shield, Plus,
  BarChart2, Sticker, Film, PhoneCall, PhoneOff, Video, Grid,
  Clock, Flame, FolderPlus, Eye, Play, Pause, Gamepad2, Languages, Palette, KeyRound,
  PenTool, Eraser, Download, User, Link as LinkIcon, Copy, BellOff, QrCode, Bot, EyeOff
} from 'lucide-react';

// --- Types ---

interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'them';
  senderName?: string;
  time: string;
  status: 'read' | 'sent' | 'pending';
  type?: string;
  reactions: Array<{ emoji: string; count: number }>;
  views?: number;
  replyTo?: Message | null;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  type: 'private' | 'bot' | 'group' | 'channel';
  role?: 'owner' | 'admin' | 'subscriber' | 'bot';
  verified?: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  archived: boolean;
  muted: boolean;
  blocked: boolean;
  messages: Message[];
  pinnedMessageId?: string | null;
  members?: number;
  subscribers?: string;
  description?: string;
  link?: string;
}

interface Story {
  id: number;
  user: string;
  avatar: string;
  image: string;
  viewed: boolean;
  time: string;
}

interface AccentColor {
  name: string;
  value: string;
}

// --- Constants & Mock Data ---

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "💩", "🥰", "🤔", "👋", "🙏", "👀", "✨"];

const ACCENT_COLORS: AccentColor[] = [
    { name: "Blue", value: "#3390ec" },
    { name: "Purple", value: "#8774e1" },
    { name: "Green", value: "#46c46e" },
    { name: "Orange", value: "#e58e39" },
    { name: "Pink", value: "#f267ad" },
    { name: "Red", value: "#e53935" },
];

const MOCK_STORIES: Story[] = [
    { id: 1, user: "Momo", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Momo", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", viewed: false, time: "2h ago" },
    { id: 2, user: "Coco", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco", image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", viewed: false, time: "4h ago" },
    { id: 3, user: "Bubu", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bubu", image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", viewed: true, time: "6h ago" }
];

const INITIAL_CHATS: Chat[] = [
  {
    id: 0, 
    name: "Saved Messages",
    avatar: "saved", 
    type: "private",
    role: "owner",
    lastMessage: "Note to self...",
    time: "Just now",
    unread: 0,
    online: true,
    archived: false,
    muted: false,
    blocked: false,
    pinnedMessageId: null,
    messages: [
       { id: "msg-1", text: "Meeting notes: Buy milk", sender: "me", time: "10:00 AM", status: 'read', reactions: [] }
    ]
  },
  {
    id: 99,
    name: "BotFather",
    avatar: "bot",
    type: "bot",
    role: "bot",
    verified: true,
    lastMessage: "I can help you create and manage Telegram bots.",
    time: "Yesterday",
    unread: 0,
    online: true,
    archived: false,
    muted: false,
    blocked: false,
    pinnedMessageId: null,
    messages: [
        { id: "msg-2", text: "I can help you create and manage Telegram bots. Try sending /newbot.", sender: "them", time: "Yesterday", status: 'read', reactions: [] }
    ]
  },
  {
    id: 10,
    name: "Design Team 🎨 (Admin)",
    avatar: "group", 
    type: "group",
    role: "admin", 
    members: 14,
    lastMessage: "Alice: New mockups are ready!",
    time: "11:00 AM",
    unread: 5,
    online: false, 
    archived: false,
    muted: false,
    blocked: false,
    pinnedMessageId: null,
    messages: [
        { id: "msg-6", text: "Guys, please check the Figma file", sender: "them", senderName: "Alice", time: "10:55 AM", status: 'read', reactions: [] }
    ]
  },
  {
    id: 20,
    name: "Tech News 🚀 (Channel)",
    avatar: "channel",
    type: "channel",
    role: "admin", 
    subscribers: "12K",
    description: "Daily doses of tech leaks and news.",
    link: "t.me/technews_daily",
    lastMessage: "New iPhone leak suggests no buttons!",
    time: "11:15 AM",
    unread: 0,
    online: false,
    archived: false,
    muted: false,
    blocked: false,
    messages: [
        { id: "msg-20-1", text: "New iPhone leak suggests no buttons!", sender: "me", time: "11:15 AM", status: 'read', reactions: [], views: 8500 }
    ]
  },
  {
    id: 21,
    name: "Cooking Master 🥘 (Muted)",
    avatar: "channel",
    type: "channel",
    role: "subscriber", 
    subscribers: "85K",
    description: "The best recipes from around the world.",
    lastMessage: "Try this 5-minute pasta recipe!",
    time: "10:00 AM",
    unread: 1,
    online: false,
    archived: false,
    muted: true,
    blocked: false,
    messages: [
        { id: "msg-21-1", text: "Try this 5-minute pasta recipe!", sender: "them", time: "10:00 AM", status: 'read', reactions: [], views: 45000 }
    ]
  }
];

// --- Helpers ---

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15);
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
  const groups: Record<string, Message[]> = {};
  messages.forEach(message => {
    const date = "Today"; // Simpler for mock data
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
  });
  return groups;
};

// --- Sub-components ---

interface RichTextRendererProps {
  text?: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ text }) => {
  if (!text || typeof text !== 'string') return null;
  const regex = /(\bhttps?:\/\/\S+|\*\*.*?\*\*|__.*?__|`.*?`|\|\|.*?\|\|)/g;
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(/^https?:\/\//)) {
          return <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all" onClick={(e)=>e.stopPropagation()}>{part}</a>;
        }
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('__') && part.endsWith('__')) return <em key={i}>{part.slice(2, -2)}</em>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-black/20 rounded px-1 font-mono text-[90%]">{part.slice(1, -1)}</code>;
        if (part.startsWith('||') && part.endsWith('||')) return <SpoilerText key={i} text={part.slice(2, -2)} />;
        return part;
      })}
    </span>
  );
};

interface SpoilerTextProps {
  text: string;
}

const SpoilerText: React.FC<SpoilerTextProps> = ({ text }) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <span 
          onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }} 
          className={`cursor-pointer px-1 rounded transition-all duration-200 ${revealed ? '' : 'bg-gray-400 text-transparent blur-[4px] select-none'}`}
        >
            {text}
        </span>
    );
};

// --- Main App ---

export default function App(): ReactNode {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [accentColor, setAccentColor] = useState<string>("#3390ec");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sidebarView, setSidebarView] = useState<'main' | 'search' | 'settings'>('main'); 
  const [activeFolder, setActiveFolder] = useState<string>('All'); 
  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // --- Logic Helpers ---
  const visibleChats = useMemo(() => {
    let filtered = chats;
    if (sidebarView === 'main') {
        if (activeFolder === 'Personal') filtered = filtered.filter(c => c.type === 'private');
        else if (activeFolder === 'Work') filtered = filtered.filter(c => c.type === 'group' || c.type === 'channel');
    }
    if (searchQuery.trim()) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [chats, sidebarView, activeFolder, searchQuery]);

  const handleOpenChat = useCallback((id: number) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  }, []);

  const handleCloseChat = useCallback(() => { setActiveChatId(null); }, []);

  const updateChatWithNewMessage = useCallback((chatId: number, message: Message) => {
    setChats(prev => {
      const idx = prev.findIndex(c => c.id === chatId);
      if (idx === -1) return prev;
      const updated = {
        ...prev[idx],
        messages: [...prev[idx].messages, message],
        lastMessage: message.text || 'Message',
        time: message.time,
      };
      const newChats = [...prev];
      newChats.splice(idx, 1);
      newChats.unshift(updated);
      return newChats;
    });
  }, []);

  const handleSendMessage = useCallback((content = inputText) => {
    if (!content.trim() || activeChatId === null) return;
    if (activeChat?.type === 'channel' && activeChat.role !== 'admin') return;

    const newMessage: Message = {
      id: generateUUID(),
      text: content, 
      sender: 'me',
      time: formatTime(new Date()),
      status: 'read',
      reactions: [],
      replyTo: replyTo ? { ...replyTo } : null
    };

    updateChatWithNewMessage(activeChatId, newMessage);
    setInputText("");
    setReplyTo(null);
  }, [inputText, activeChatId, activeChat, replyTo, updateChatWithNewMessage]);

  useEffect(() => {
    if (activeChatId !== null && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatId]);

  const sidebarBg = darkMode ? "bg-[#212121]" : "bg-white"; 
  const borderClass = darkMode ? "border-black" : "border-gray-200";
  const hoverClass = darkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-gray-100";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const subTextClass = darkMode ? "text-gray-400" : "text-gray-500";

  const dynamicStyles = useMemo(() => `
    .text-accent { color: ${accentColor} !important; }
    .bg-accent { background-color: ${accentColor} !important; }
    .border-accent { border-color: ${accentColor} !important; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes messagePopIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .animate-message { animation: messagePopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `, [accentColor]);

  return (
    <div className={`font-sans h-[100dvh] overflow-hidden flex justify-center items-center ${darkMode ? 'bg-[#0f0f0f]' : 'bg-gray-200'} text-gray-800`}>
      <style>{dynamicStyles}</style>

      {/* --- Main App Container --- */}
      <div className={`w-full h-full relative flex shadow-2xl overflow-hidden md:max-w-[1600px] md:h-full ${sidebarBg}`}>
        
        {/* --- LEFT SIDEBAR (Md screen thekei always 1/3 width) --- */}
        <div 
          className={`
            h-full flex flex-col z-20 ${borderClass} ${sidebarBg} md:border-r 
            transition-all duration-300 relative
            ${activeChatId !== null ? 'hidden md:flex md:w-1/3 lg:w-1/3' : 'w-full md:w-1/3 lg:w-1/3 flex'}
          `}
        >
          {/* Fixed Header Section */}
          <header className="px-3 pt-2 pb-1 flex flex-col shrink-0 relative bg-inherit z-30">
             <div className="flex gap-3 items-center w-full">
                <button onClick={() => setIsMainMenuOpen(!isMainMenuOpen)} className={`p-2 rounded-full transition duration-200 ${isMainMenuOpen ? 'bg-gray-100 text-accent' : subTextClass} ${hoverClass}`}><Menu className="w-6 h-6" /></button>
                <div className={`flex-1 rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-accent transition duration-200 group ${darkMode ? 'bg-[#1c1c1d] border-gray-700' : 'bg-gray-100'}`}>
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className={`bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-500 min-w-0 ${textClass}`}/>
                </div>
             </div>
             
             {isMainMenuOpen && (
              <div className={`absolute top-14 left-4 rounded-xl shadow-xl border w-64 py-2 z-50 animate-message flex flex-col ${sidebarBg} ${borderClass}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />} {darkMode ? "Light Mode" : "Night Mode"}</button>
                <button className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Settings size={20} /> Settings</button>
              </div>
            )}
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
              {/* Stories */}
              <div className="px-3 pb-2 pt-1 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                      <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-accent transition duration-200"><Plus size={24}/></div>
                          <span className="text-[11px] text-gray-500 font-medium">My Story</span>
                      </div>
                      {MOCK_STORIES.map(story => (
                          <div key={story.id} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer">
                              <div className={`w-14 h-14 rounded-full p-[2px] transition transform hover:scale-105 ${story.viewed ? 'bg-gray-300' : 'bg-accent'}`}>
                                  <img src={story.avatar} className={`w-full h-full rounded-full border-2 ${darkMode ? 'border-[#212121]' : 'border-white'} object-cover`} alt={story.user} />
                              </div>
                              <span className={`text-[11px] font-medium ${textClass}`}>{story.user}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Folders Row */}
              <div className="px-3 flex items-center gap-4 overflow-x-auto no-scrollbar pt-1">
                 {['All', 'Personal', 'Work'].map(folder => (
                     <button 
                        key={folder} 
                        onClick={() => setActiveFolder(folder)} 
                        className={`pb-2 pt-1 text-sm font-medium transition whitespace-nowrap border-b-2 ${activeFolder === folder ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                     >
                         {folder}
                     </button>
                 ))}
              </div>
              
              {/* Chat Listing */}
              <div className="mt-1 pb-24"> 
                  {visibleChats.map((chat) => (
                    <div key={chat.id} onClick={() => handleOpenChat(chat.id)} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition duration-200 select-none ${activeChatId === chat.id ? 'bg-accent text-white' : hoverClass}`}>
                        <div className="relative shrink-0">
                           {chat.avatar === 'saved' ? <div className="w-12 h-12 rounded-full flex items-center justify-center bg-accent"><Bookmark className="text-white" /></div> : 
                            chat.avatar === 'bot' ? <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500"><Bot className="text-white" /></div> :
                            <img src={chat.avatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover" alt={chat.name} />}
                           {chat.online && <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${activeChatId === chat.id ? 'bg-white border-accent' : 'bg-green-500 border-white'}`}></div>}
                        </div>
                        <div className={`flex-1 min-w-0 border-b pb-2 ml-1 h-full flex flex-col justify-center ${borderClass} ${activeChatId === chat.id ? 'border-transparent' : ''}`}>
                            <div className="flex justify-between items-baseline">
                                <h3 className={`font-semibold text-[15px] truncate ${activeChatId === chat.id ? 'text-white' : textClass}`}>{chat.name}</h3>
                                <span className={`text-[11px] ${activeChatId === chat.id ? 'text-white/80' : subTextClass}`}>{chat.time}</span>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                <p className={`text-[14px] truncate flex-1 min-w-0 ${activeChatId === chat.id ? 'text-white/80' : subTextClass}`}>
                                  {chat.lastMessage}
                                </p>
                                {chat.unread > 0 && <div className={`min-w-[18px] h-4 px-1 text-[10px] font-bold rounded-full flex items-center justify-center ml-2 ${activeChatId === chat.id ? 'bg-white text-accent' : 'bg-[#c4c9cc] text-white'}`}>{chat.unread}</div>}
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
          
          {/* Floating Action Button */}
          <button className="absolute bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition duration-200 z-40">
             <Edit2 size={24} />
          </button>
        </div>

        {/* --- MAIN CHAT AREA --- */}
        <div className={`flex-1 flex-col relative bg-[#0e1621] ${activeChatId === null ? 'hidden md:flex' : 'flex w-full fixed inset-0 md:static z-30'}`}>
          {activeChat ? (
            <>
              <header className={`px-4 py-2 flex items-center justify-between shadow-sm z-10 shrink-0 h-[60px] ${sidebarBg}`}>
                <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <button onClick={(e) => { e.stopPropagation(); handleCloseChat(); }} className="md:hidden text-gray-500"><ArrowLeft /></button>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                      {activeChat.avatar === 'saved' ? <div className="w-full h-full bg-accent flex items-center justify-center"><Bookmark className="text-white w-5 h-5" /></div> : 
                       activeChat.avatar === 'bot' ? <div className="w-full h-full bg-blue-500 flex items-center justify-center"><Bot className="text-white w-5 h-5" /></div> : 
                       <img src={activeChat.avatar} className="w-full h-full object-cover" alt={activeChat.name} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className={`font-bold text-[16px] leading-tight truncate ${textClass}`}>{activeChat.name} {activeChat.verified && <CheckCircle size={12} className="text-blue-500 inline-block ml-1 fill-white" />}</h2>
                    <span className={`text-[13px] truncate ${activeChat.online ? 'text-accent' : 'text-gray-500'}`}>
                        {activeChat.type === 'bot' ? 'bot' : activeChat.type === 'group' ? `${activeChat.members} members` : activeChat.type === 'channel' ? `${activeChat.subscribers} subscribers` : activeChat.online ? 'online' : 'last seen recently'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-gray-500 items-center">
                    <Search size={20} className="cursor-pointer hover:text-accent" />
                    <Phone size={20} className="cursor-pointer hover:text-accent" />
                    <MoreVertical size={20} className="cursor-pointer hover-text-accent" />
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-2 relative bg-[#99ba92]">
                <div className="absolute inset-0 opacity-40 pointer-events-none telegram-bg" style={{backgroundColor: darkMode ? '#0f0f0f' : '#7a8c76'}}></div>
                <div className="relative z-0 max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-2">
                    {Object.entries(groupMessagesByDate(activeChat.messages)).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center my-2 sticky top-2 z-10"><span className="bg-black/20 text-white text-[11px] px-2 py-0.5 rounded-full backdrop-blur-sm">{date}</span></div>
                            {msgs.map((msg) => {
                                const isMe = msg.sender === 'me';
                                return (
                                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-1 group animate-message`}>
                                        <div className={`relative max-w-[85%] px-3 py-1.5 shadow-sm text-[15px] rounded-lg ${isMe ? `bg-accent text-white rounded-tr-none` : `${sidebarBg} ${textClass} rounded-tl-none`}`}>
                                            <RichTextRenderer text={msg.text} />
                                            <div className="float-right flex items-center gap-1 ml-2 mt-2 select-none h-3 relative top-0.5">
                                                <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-gray-400'}`}>{msg.time.split(' ')[0]}</span>
                                                {isMe && <CheckCheck className={`w-3 h-3 ${darkMode ? 'text-blue-300' : 'text-blue-400'}`} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Section */}
              {activeChat.type === 'channel' && activeChat.role !== 'admin' ? (
                  <div className={`p-4 border-t text-center ${sidebarBg} ${textClass} font-medium`}>Muted by Admin</div>
              ) : (
                <div className={`px-2 py-2 z-10 w-full md:px-[5%] lg:px-[10%] ${sidebarBg} relative`}>
                    <div className="flex items-end gap-2 w-full">
                        <button className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition"><Paperclip size={24} /></button>
                        <div className={`flex-1 relative rounded-2xl flex items-center pr-2 ${darkMode ? 'bg-[#1c1c1d]' : 'bg-gray-100'}`}>
                            <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Message" className={`flex-1 bg-transparent border-none outline-none px-4 py-3 min-w-0 ${textClass}`} />
                        </div>
                        <button onClick={() => handleSendMessage()} className="p-3 hover:opacity-90 rounded-full text-white bg-accent">
                            <Send size={24} className="fill-current" />
                        </button>
                    </div>
                </div>
              )}
            </>
          ) : (
              <div className={`flex-1 flex flex-col items-center justify-center ${darkMode ? 'bg-[#0f0f0f]' : 'bg-[#99ba92]'}`}>
                  <div className="bg-black/20 text-white px-4 py-1 rounded-full text-sm">Select a chat to start messaging</div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
