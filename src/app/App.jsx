import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// --- Constants & Config ---

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "💩", "🥰", "🤔", "👋", "🙏", "👀", "✨"];

const ACCENT_COLORS = [
    { name: "Blue", value: "#3390ec" },
    { name: "Purple", value: "#8774e1" },
    { name: "Green", value: "#46c46e" },
    { name: "Orange", value: "#e58e39" },
    { name: "Pink", value: "#f267ad" },
    { name: "Red", value: "#e53935" },
];

const STICKERS = [
  "https://cdn-icons-png.flaticon.com/128/9408/9408166.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408201.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408175.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408226.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408183.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408238.png"
];

const GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZGI4Z3J5aG56Y3h6Z3I1Z3I1Z3I1Z3I1Z3I1Z3I1/3o7TKSjRrfIPjeiVyM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZGI4Z3J5aG56Y3h6Z3I1Z3I1Z3I1Z3I1Z3I1Z3I1/26AHONQ79FdWZhAI0/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZGI4Z3J5aG56Y3h6Z3I1Z3I1Z3I1Z3I1Z3I1Z3I1/l0HlHJGHe3yAMhdQY/giphy.gif"
];

const MOCK_STORIES = [
    { id: 1, user: "Momo", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Momo", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", viewed: false, time: "2h ago" },
    { id: 2, user: "Coco", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco", image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", viewed: false, time: "4h ago" },
    { id: 3, user: "Bubu", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bubu", image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", viewed: true, time: "6h ago" }
];

const MOCK_CONTACTS = [
  { id: 101, name: "Alice Wonderland", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice", bio: "Curiouser and curiouser!" },
  { id: 102, name: "Bob Builder", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", bio: "Can we fix it?" },
  { id: 103, name: "Charlie Chaplin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie", bio: "Silence is golden." }
];

const INITIAL_CHATS = [
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
       { id: "msg-1", text: "Meeting notes: Buy milk", sender: "me", time: "10:00 AM", status: 'read', type: 'text', reactions: [] }
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
    id: 1,
    name: "Momo 🌸",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Momo",
    type: "private",
    role: "owner",
    lastMessage: "It's a secret! ||Don't tell anyone||",
    time: "10:42 AM",
    unread: 2,
    online: true,
    archived: false,
    muted: false,
    blocked: false,
    bio: "Cat lover | Designer 🎨",
    mobile: "+1 234 567 890",
    pinnedMessageId: null,
    messages: [
      { id: "msg-3", text: "Hey! Are we still meeting?", sender: "them", time: "10:30 AM", status: 'read', reactions: [] },
      { id: "msg-4", text: "Yes! I'm on my way 🚗", sender: "me", time: "10:32 AM", status: 'read', reactions: [{emoji: "🔥", count: 1, me: true}] },
      { id: "msg-5", text: "It's a secret! ||Don't tell anyone||", sender: "them", time: "10:42 AM", status: 'read', reactions: [{emoji: "❤️", count: 2, me: false}] }
    ]
  },
  {
    id: 10,
    name: "Design Team 🎨",
    avatar: "group", 
    type: "group",
    role: "member", 
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
        { id: "msg-6", text: "Guys, please check the Figma file", sender: "them", senderName: "Alice", time: "10:55 AM", status: 'read', reactions: [] },
        { 
            id: "msg-7", 
            type: "poll", 
            sender: "me", 
            senderName: "Me", 
            time: "10:56 AM", 
            status: 'read', 
            reactions: [],
            question: "When should we launch?", 
            options: [
                { id: 1, text: "Monday", votes: 2, voted: false },
                { id: 2, text: "Wednesday", votes: 5, voted: true },
                { id: 3, text: "Friday", votes: 1, voted: false }
            ]
        }
    ]
  },
  {
    id: 11,
    name: "My Announcements 📢",
    avatar: "channel",
    type: "channel",
    role: "admin", 
    subscribers: "5.2K",
    description: "Official channel for my app updates and news.",
    link: "t.me/my_announcements",
    lastMessage: "Broadcast: New update live!",
    time: "9:00 AM",
    unread: 0,
    online: false,
    archived: false,
    muted: false,
    blocked: false,
    pinnedMessageId: null,
    messages: [
        { id: "msg-8", text: "We just launched version 2.0! Enjoy.", sender: "me", time: "9:00 AM", status: 'read', reactions: [{emoji: "🔥", count: 152, me: true}], views: 4500 }
    ]
  },
  {
    id: 12,
    name: "Telegram Tips 💡",
    avatar: "channel",
    type: "channel",
    role: "subscriber",
    subscribers: "125K",
    description: "Daily tips and tricks to get the most out of Telegram.",
    link: "t.me/telegram_tips",
    lastMessage: "Tip #45: Use folders",
    time: "Yesterday",
    unread: 1,
    online: false,
    archived: false,
    muted: true,
    blocked: false,
    pinnedMessageId: null,
    messages: [
        { id: "msg-9", text: "Did you know you can organize chats into folders? Go to Settings > Folders.", sender: "them", time: "Yesterday", status: 'read', reactions: [{emoji: "👍", count: 1200, me: false}], views: 56000 }
    ]
  },
  {
    id: 2,
    name: "Coco 🥥",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco",
    type: "private",
    role: "owner",
    lastMessage: "Sticker",
    time: "9:15 AM",
    unread: 0,
    online: false,
    archived: false,
    muted: false,
    blocked: false,
    bio: "Living life one coconut at a time",
    messages: [
      { id: "msg-10", text: "Did you finish the design?", sender: "them", time: "9:00 AM", status: 'read', reactions: [] },
      { id: "msg-11", text: "Almost done!", sender: "me", time: "9:10 AM", status: 'read', reactions: [] }
    ]
  }
];

const MOCK_REPLIES = ["Okay! 👍", "Haha really? 😂", "Sounds good.", "Send me a pic!", "Wait, what?", "Nice!", "I'll check it out.", "👀"];

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(message => {
    const d = new Date(message.time);
    const date = isNaN(d.getTime()) ? message.time.split(' ')[0] : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
  });
  return groups;
};

const RichTextRenderer = ({ text }) => {
  if (!text) return null;
  const regex = /(\bhttps?:\/\/\S+|\*\*.*?\*\*|__.*?__|`.*?`|\|\|.*?\|\|)/g;
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(/^https?:\/\//)) {
          return <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all" onClick={(e)=>e.stopPropagation()}>{part}</a>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return <em key={i}>{part.slice(2, -2)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-black/20 rounded px-1 font-mono text-[90%]">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('||') && part.endsWith('||')) {
           return <SpoilerText key={i} text={part} />;
        }
        return part;
      })}
    </span>
  );
};

const SpoilerText = ({ text }) => {
    const [revealed, setRevealed] = useState(false);
    const content = text.replace(/^\|\||\|\|$/g, '');
    return (
        <span 
          onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }} 
          className={`cursor-pointer px-1 rounded transition-all duration-200 ${revealed ? '' : 'bg-gray-400 text-transparent blur-[4px] select-none'}`}
        >
            {content}
        </span>
    );
};

const checkPermission = (role, action) => {
    const policies = {
        'owner': ['delete', 'pin', 'edit', 'post', 'invite'],
        'admin': ['delete', 'pin', 'post', 'invite'],
        'member': ['post', 'invite'],
        'subscriber': [], 
        'bot': ['post']
    };
    return policies[role]?.includes(action) || false;
};

const performSearch = (list, query, keys) => {
    if (!query) return list;
    const lowerQuery = query.toLowerCase();
    return list.filter(item => {
        return keys.some(key => {
            const val = item[key];
            if (typeof val === 'string') return val.toLowerCase().includes(lowerQuery);
            return false;
        });
    });
};

const AuthScreen = ({ onLogin, darkMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if(username && password) {
          setIsLoading(true);
          setTimeout(() => {
              onLogin();
          }, 800);
      }
    };

    return (
      <div className={`h-full w-full flex items-center justify-center ${darkMode ? 'bg-[#0f0f0f]' : 'bg-gray-100'}`}>
         <div className={`w-full max-w-[400px] p-10 rounded-2xl shadow-xl flex flex-col items-center animate-login ${darkMode ? 'bg-[#1c1c1d] text-white' : 'bg-white text-gray-900'}`}>
             <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-[#3390ec]">
                 <Bot className="w-16 h-16 text-white" />
             </div>
             <h1 className="text-2xl font-bold mb-2">Sign in</h1>
             <p className={`text-center mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please enter your username and password.</p>
             <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                 <div className="relative group">
                     <input type="text" id="username" className={`peer w-full border rounded-xl px-4 pt-5 pb-2 outline-none transition-colors ${darkMode ? 'bg-transparent border-gray-600 focus:border-[#3390ec]' : 'bg-transparent border-gray-300 focus:border-[#3390ec]'}`} value={username} onChange={(e) => setUsername(e.target.value)} required />
                     <label htmlFor="username" className={`absolute left-4 top-3.5 text-gray-500 text-base transition-all duration-200 peer-focus:text-xs peer-focus:top-1 peer-focus:text-[#3390ec] ${username ? 'text-xs top-1' : ''}`}>Username</label>
                 </div>
                 <div className="relative group">
                     <input type={showPassword ? "text" : "password"} id="password" className={`peer w-full border rounded-xl px-4 pt-5 pb-2 pr-10 outline-none transition-colors ${darkMode ? 'bg-transparent border-gray-600 focus:border-[#3390ec]' : 'bg-transparent border-gray-300 focus:border-[#3390ec]'}`} value={password} onChange={(e) => setPassword(e.target.value)} required />
                     <label htmlFor="password" className={`absolute left-4 top-3.5 text-gray-500 text-base transition-all duration-200 peer-focus:text-xs peer-focus:top-1 peer-focus:text-[#3390ec] ${password ? 'text-xs top-1' : ''}`}>Password</label>
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-400 hover:text-gray-600">
                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                 </div>
                 <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95 flex justify-center items-center ${isLoading ? 'opacity-80' : ''}`} style={{backgroundColor: "#3390ec"}}>
                     {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Log In"}
                 </button>
             </form>
         </div>
      </div>
    );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [accentColor, setAccentColor] = useState("#3390ec");
  
  const [sidebarView, setSidebarView] = useState('main'); 
  const [activeFolder, setActiveFolder] = useState('All'); 
  const [folders, setFolders] = useState([
      { id: 'All', name: 'All', type: 'all', locked: false },
      { id: 'Personal', name: 'Personal', type: 'private', locked: true },
      { id: 'Work', name: 'Work', type: 'group', locked: false }
  ]);
  const [unlockedFolders, setUnlockedFolders] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  
  const [myProfile, setMyProfile] = useState({ 
    name: "Me", 
    bio: "Available", 
    phone: "+880 1700 000000", 
    username: "@me_user" 
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({...myProfile});

  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null); 
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState('emoji'); 
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selfDestructTime, setSelfDestructTime] = useState(0); 
  const [isTimerMenuOpen, setIsTimerMenuOpen] = useState(false);
  const [isScheduleMenuOpen, setIsScheduleMenuOpen] = useState(false);
  
  const [forwardState, setForwardState] = useState({ isOpen: false, messageId: null });
  
  const [callState, setCallState] = useState({ 
    isActive: false, isRinging: false, isConnected: false, type: 'audio', startTime: null 
  });
  
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
  
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderData, setNewFolderData] = useState({ name: '', type: 'all' });
  
  const [viewingStory, setViewingStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [targetFolder, setTargetFolder] = useState(null);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const [msgContextMenu, setMsgContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const [chatListContextMenu, setChatListContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');

  const activeChat = chats.find((c) => c.id === activeChatId);
  const pinnedMessage = activeChat?.messages.find(m => m.id === activeChat?.pinnedMessageId);

  const bgClass = darkMode ? "bg-[#0f0f0f]" : "bg-white";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const subTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const sidebarBg = darkMode ? "bg-[#212121]" : "bg-white"; 
  const borderClass = darkMode ? "border-black" : "border-gray-200";
  const hoverClass = darkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-gray-100";
  const myBubble = `text-white`; 
  const theirBubble = darkMode ? "bg-[#212121] text-white" : "bg-white text-black";

  const dynamicStyles = useMemo(() => `
    .text-accent { color: ${accentColor} !important; }
    .bg-accent { background-color: ${accentColor} !important; }
    .border-accent { border-color: ${accentColor} !important; }
    .hover-text-accent:hover { color: ${accentColor} !important; }
    .hover-bg-accent:hover { background-color: ${accentColor} !important; }
    .group:focus-within .focus-within-text-accent { color: ${accentColor} !important; }
    .focus-within-border-accent:focus-within { border-color: ${accentColor} !important; }
    .selection-accent::selection { background-color: ${accentColor}; color: white; }
    @keyframes messagePopIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .animate-message { animation: messagePopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
    .typing-dot { animation: typingBounce 1.4s infinite ease-in-out both; }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    .toggle-checkbox:checked { right: 0; border-color: ${accentColor}; }
    .toggle-checkbox:checked + .toggle-label { background-color: ${accentColor}; }
    @keyframes loginFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-login { animation: loginFadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
  `, [accentColor]);

  const handleBotCommand = (chatId, command) => {
      const chat = chats.find(c => c.id === chatId);
      if(!chat || chat.type !== 'bot') return;

      const reply = (text) => {
          setTimeout(() => {
              updateChatWithNewMessage(chatId, { 
                  id: generateUUID(), 
                  text, 
                  sender: 'them', 
                  time: formatTime(new Date()), 
                  status: 'read', 
                  reactions: [] 
              });
          }, 600);
      };

      if (command.startsWith('/start')) {
          reply("Welcome! I am a bot. Use /help to see what I can do.");
      } else if (command.startsWith('/help')) {
          reply("Commands:\n/start - Restart bot\n/ping - Check status\n/echo [text] - Echo text");
      } else if (command.startsWith('/ping')) {
          reply("Pong! 🏓");
      } else if (command.startsWith('/echo')) {
          const content = command.replace('/echo', '').trim();
          reply(content || "Please provide text to echo.");
      } else {
          reply("I don't understand that command.");
      }
  };

  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          setChats(prevChats => {
              let changed = false;
              const newChats = prevChats.map(chat => {
                  const hasExpired = chat.messages.some(msg => msg.expiresAt && now > msg.expiresAt);
                  if (hasExpired) {
                      changed = true;
                      return {
                          ...chat,
                          messages: chat.messages.filter(msg => {
                              if (msg.expiresAt && now > msg.expiresAt) return false;
                              return true;
                          })
                      };
                  }
                  return chat;
              });
              return changed ? newChats : prevChats;
          });
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let storyTimer;
    if (viewingStory) {
        setStoryProgress(0);
        const duration = 5000; 
        const interval = 50; 
        const step = 100 / (duration / interval);
        storyTimer = setInterval(() => {
            setStoryProgress(prev => {
                if (prev >= 100) {
                    clearInterval(storyTimer);
                    setViewingStory(null);
                    return 0;
                }
                return prev + step;
            });
        }, interval);
    }
    return () => { if (storyTimer) clearInterval(storyTimer); };
  }, [viewingStory]);

  useEffect(() => {
    if (activeChatId !== null && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatId, isTyping]);

  useEffect(() => {
    setMsgContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    setChatListContextMenu({ visible: false, x: 0, y: 0, chatId: null });
    setShowEmojiPicker(false);
    setIsAttachMenuOpen(false);
    setIsTimerMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setReplyTo(null);
    setEditingMessageId(null);
    setIsChatSearchOpen(false);
    setChatSearchQuery("");
    setIsTyping(false); 
  }, [activeChatId]);

  useEffect(() => {
      if (isDrawingOpen && canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = canvas.offsetWidth * 2;
          canvas.height = canvas.offsetHeight * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(2, 2);
            ctx.lineCap = 'round';
            ctx.strokeStyle = drawingColor;
            ctx.lineWidth = 3;
            contextRef.current = ctx;
          }
      }
  }, [isDrawingOpen, drawingColor]);

  useEffect(() => {
    const handleClick = () => {
      if (msgContextMenu.visible) setMsgContextMenu(prev => ({ ...prev, visible: false }));
      if (chatListContextMenu.visible) setChatListContextMenu(prev => ({ ...prev, visible: false }));
      if (isMainMenuOpen) setIsMainMenuOpen(false);
      if (isCreateMenuOpen) setIsCreateMenuOpen(false);
      if (showEmojiPicker) setShowEmojiPicker(false);
      if (isAttachMenuOpen) setIsAttachMenuOpen(false);
      if (isTimerMenuOpen) setIsTimerMenuOpen(false);
      if (isScheduleMenuOpen) setIsScheduleMenuOpen(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [msgContextMenu.visible, chatListContextMenu.visible, isMainMenuOpen, isCreateMenuOpen, showEmojiPicker, isAttachMenuOpen, isTimerMenuOpen, isScheduleMenuOpen]);

  const getMessageText = useCallback((msg) => {
      if (typeof msg.text === 'string') return msg.text;
      return "Message";
  }, []);

  const formatPreviewMessage = useCallback((text, type) => {
    if (type === 'image') return '🖼️ Photo';
    if (type === 'sticker') return 'Sticker';
    if (type === 'gif') return 'GIF';
    if (type === 'poll') return '📊 Poll';
    if (type === 'game') return '🎮 Game';
    if (typeof text !== 'string') return '';
    return text.replace(/\|\|.*?\|\|/g, "▒▒▒▒▒");
  }, []);

  const getVisibleChats = useCallback(() => {
    const currentFolderObj = folders.find(f => f.id === activeFolder);
    if (currentFolderObj?.locked && !unlockedFolders.includes(activeFolder)) {
        return [];
    }

    let filtered = chats;
    if (sidebarView === 'archived') {
        filtered = filtered.filter(c => c.archived);
    } else if (sidebarView === 'main') {
        filtered = filtered.filter(c => !c.archived);
        if (currentFolderObj && currentFolderObj.type !== 'all') {
            if (currentFolderObj.type === 'private') filtered = filtered.filter(c => c.type === 'private');
            else if (currentFolderObj.type === 'group') filtered = filtered.filter(c => c.type === 'group' || c.type === 'channel');
        }
    }
    
    if (searchQuery.trim()) {
        filtered = performSearch(filtered, searchQuery, ['name']);
    }
    return filtered;
  }, [chats, sidebarView, activeFolder, folders, unlockedFolders, searchQuery]);

  const visibleChats = getVisibleChats();

  const handleOpenChat = useCallback((id) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    if (window.innerWidth < 768) setIsProfileOpen(false); 
  }, []);

  const handleCloseChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const handleSaveSettings = useCallback(() => {
    setMyProfile(tempProfile);
    setIsEditingProfile(false);
  }, [tempProfile]);

  const updateChatWithNewMessage = useCallback((chatId, message) => {
    setChats(prev => {
      const idx = prev.findIndex(c => c.id === chatId);
      if (idx === -1) return prev;
      const updated = {
        ...prev[idx],
        messages: [...prev[idx].messages, message],
        lastMessage: message.type === 'image' ? '🖼️ Photo' : 
                     message.type === 'sticker' ? 'Sticker' : 
                     message.type === 'gif' ? 'GIF' : 
                     message.type === 'poll' ? '📊 Poll' : 
                     message.type === 'game' ? '🎮 Game' : 
                     message.text || '',
        time: message.time,
        archived: false
      };
      const newChats = [...prev];
      newChats.splice(idx, 1);
      newChats.unshift(updated);
      return newChats;
    });
  }, []);

  const handleSendMessage = useCallback((content = inputText, type = 'text', scheduled = false) => {
    if (!content && !selectedFile && !isRecording) return;
    if (activeChatId === null) return;

    if (activeChat && !checkPermission(activeChat.role, 'post') && activeChat.type === 'channel') {
        alert("You do not have permission to post in this channel.");
        return;
    }

    if (editingMessageId) {
        setChats(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: c.messages.map(m => 
                        m.id === editingMessageId 
                        ? { ...m, text: content.trim(), isEdited: true } 
                        : m
                    )
                };
            }
            return c;
        }));
        setEditingMessageId(null);
        setInputText("");
        return;
    }

    const now = new Date();
    const timeString = formatTime(now);
    
    let messageContent = content;
    let messageType = type;

    if (selectedFile) {
        messageContent = selectedFile.name;
        messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
    } else if (isRecording) {
        messageContent = "Voice Message (0:05)";
        messageType = 'voice';
    }

    const newMessage = {
      id: generateUUID(),
      text: messageContent, 
      type: messageType,
      fileUrl: selectedFile && messageType === 'image' ? URL.createObjectURL(selectedFile) : 
              (messageType === 'sticker' || messageType === 'gif' || messageType === 'image' ? content : null),
      sender: 'me',
      time: timeString,
      status: 'sent',
      reactions: [],
      replyTo: replyTo ? { ...replyTo } : null,
      expiresAt: selfDestructTime > 0 ? Date.now() + (selfDestructTime * 1000) + 2000 : null, 
      selfDestructTime: selfDestructTime,
      gameState: messageType === 'game' ? { 
        board: Array(9).fill(null), 
        xIsNext: true, 
        winner: null 
      } : null,
      views: 1,
      isScheduled: scheduled
    };

    if (scheduled) {
        alert(`Message scheduled`);
    }

    updateChatWithNewMessage(activeChatId, newMessage);
    
    setInputText("");
    setReplyTo(null);
    setSelectedFile(null);
    setIsRecording(false);
    setShowEmojiPicker(false);
    setIsScheduleMenuOpen(false);

    if (activeChat && activeChat.type === 'bot') {
        handleBotCommand(activeChatId, messageContent);
    } else if (activeChatId !== 0 && activeChat && activeChat.type !== 'channel') {
        setTimeout(() => {
            setChats(prev => prev.map(c => 
              c.id === activeChatId 
                ? { ...c, messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m) } 
                : c
            ));
        }, 1000);

        if (activeChat.type === 'private') {
            setTimeout(() => {
                setIsTyping(true);
            }, 1000);

            setTimeout(() => {
                setIsTyping(false);
                const replyText = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
                updateChatWithNewMessage(activeChatId, { 
                  id: generateUUID(), 
                  text: replyText, 
                  type: 'text', 
                  sender: 'them', 
                  time: formatTime(new Date()), 
                  status: 'read', 
                  reactions: [] 
                });
            }, 3000);
        }
    }
  }, [inputText, selectedFile, isRecording, activeChatId, editingMessageId, updateChatWithNewMessage, activeChat, replyTo, selfDestructTime]);

  const handleCreateFolder = useCallback(() => {
      if (!newFolderData.name.trim()) return;
      const newFolder = { id: newFolderData.name, name: newFolderData.name, type: newFolderData.type, locked: false };
      setFolders([...folders, newFolder]);
      setFolderModalOpen(false);
      setNewFolderData({ name: '', type: 'all' });
  }, [newFolderData, folders]);

  const handleCreatePoll = useCallback(() => {
      const options = pollData.options.filter(o => o.trim() !== '');
      if (!pollData.question.trim() || options.length < 2) return;
      const newMessage = { 
        id: generateUUID(), 
        type: 'poll', 
        sender: 'me', 
        time: formatTime(new Date()), 
        status: 'sent', 
        question: pollData.question, 
        options: options.map((opt, i) => ({ id: i, text: opt, votes: 0, voted: false })), 
        reactions: [] 
      };
      if (activeChatId) {
        updateChatWithNewMessage(activeChatId, newMessage);
      }
      setPollModalOpen(false);
      setPollData({ question: '', options: ['', ''] });
  }, [pollData, activeChatId, updateChatWithNewMessage]);

  const handleVote = useCallback((messageId, optionId) => {
      setChats(prev => prev.map(c => {
          if (c.id === activeChatId) {
              return { 
                ...c, 
                messages: c.messages.map(m => { 
                  if (m.id === messageId && m.type === 'poll' && m.options) { 
                    return { 
                      ...m, 
                      options: m.options.map(opt => { 
                        if (opt.id === optionId && !opt.voted) return { ...opt, votes: opt.votes + 1, voted: true }; 
                        if (opt.voted && opt.id !== optionId) return { ...opt, votes: opt.votes - 1, voted: false }; 
                        return opt; 
                      }) 
                    } 
                  } 
                  return m; 
                }) 
              }
          } 
          return c;
      }));
  }, [activeChatId]);

  const handleMuteToggle = useCallback(() => {
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, muted: !c.muted } : c));
  }, [activeChatId]);

  const handleFolderClick = useCallback((folderId) => {
      const folder = folders.find(f => f.id === folderId);
      if (folder?.locked && !unlockedFolders.includes(folderId)) {
          setTargetFolder(folderId);
          setLockModalOpen(true);
      } else {
          setActiveFolder(folderId);
      }
  }, [folders, unlockedFolders]);

  const handleUnlockFolder = useCallback(() => {
      if (passcodeInput === "1234") {
          setUnlockedFolders(prev => [...prev, targetFolder]);
          setActiveFolder(targetFolder);
          setLockModalOpen(false);
          setPasscodeInput("");
      } else {
          alert("Incorrect Passcode (Hint: 1234)");
          setPasscodeInput("");
      }
  }, [passcodeInput, targetFolder]);

  const calculateWinner = useCallback((squares) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const handleGameMove = useCallback((messageId, index) => {
      setChats(prev => prev.map(c => {
          if (c.id === activeChatId) {
              return { 
                ...c, 
                messages: c.messages.map(m => {
                  if (m.id === messageId && m.type === 'game' && m.gameState && !m.gameState.winner && !m.gameState.board[index]) {
                      const newBoard = [...m.gameState.board];
                      newBoard[index] = m.gameState.xIsNext ? 'X' : 'O';
                      const winner = calculateWinner(newBoard);
                      return { ...m, gameState: { board: newBoard, xIsNext: !m.gameState.xIsNext, winner } };
                  }
                  return m;
              })}
          }
          return c;
      }));
  }, [activeChatId, calculateWinner]);

  const startDrawing = useCallback((nativeEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    const rect = canvas.getBoundingClientRect();
    let offsetX, offsetY;
    if (nativeEvent.touches) {
      offsetX = nativeEvent.touches[0].clientX - rect.left;
      offsetY = nativeEvent.touches[0].clientY - rect.top;
    } else {
      offsetX = nativeEvent.nativeEvent.offsetX;
      offsetY = nativeEvent.nativeEvent.offsetY;
    }
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  }, []);

  const finishDrawing = useCallback(() => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  }, []);

  const draw = useCallback((nativeEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let offsetX, offsetY;
    if (nativeEvent.touches) {
      offsetX = nativeEvent.touches[0].clientX - rect.left;
      offsetY = nativeEvent.touches[0].clientY - rect.top;
    } else {
      offsetX = nativeEvent.nativeEvent.offsetX;
      offsetY = nativeEvent.nativeEvent.offsetY;
    }
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  }, [isDrawing]);

  const sendDrawing = useCallback(() => {
      if (!canvasRef.current) return;
      const image = canvasRef.current.toDataURL("image/png");
      handleSendMessage(image, 'image');
      setIsDrawingOpen(false);
  }, [handleSendMessage]);

  const startCall = useCallback((type) => { 
    setCallState({ isActive: true, isRinging: true, isConnected: false, type: type, startTime: null }); 
    setTimeout(() => { setCallState(prev => prev.isActive ? ({ ...prev, isRinging: false, isConnected: true, startTime: Date.now() }) : prev); }, 3000); 
  }, []);

  const endCall = useCallback(() => { 
    setCallState({ isActive: false, isRinging: false, isConnected: false, type: 'audio', startTime: null }); 
  }, []);

  const handleCreateChat = useCallback((type) => { 
    const id = Date.now(); 
    const newChat = { 
      id, 
      name: type === 'channel' ? "New Channel" : (type === 'group' ? "New Group" : "New Chat"), 
      avatar: type, 
      type, 
      role: 'admin', 
      members: type === 'group' ? 1 : undefined, 
      subscribers: type === 'channel' ? "1" : undefined, 
      lastMessage: type === 'channel' ? "Channel created" : "Group created", 
      time: "Just now", 
      unread: 0, 
      online: false, 
      blocked: false, 
      archived: false, 
      muted: false, 
      pinnedMessageId: null, 
      messages: [] 
    }; 
    setChats([newChat, ...chats]); 
    handleOpenChat(id); 
    setIsCreateMenuOpen(false); 
  }, [chats, handleOpenChat]);

  const handleStartContactChat = useCallback((contact) => { 
    const existing = chats.find(c => c.name === contact.name); 
    if (existing) {
      handleOpenChat(existing.id); 
    } else { 
      const newChat = { 
        id: Date.now(), 
        name: contact.name, 
        avatar: contact.avatar, 
        type: "private", 
        role: 'owner', 
        bio: contact.bio, 
        lastMessage: "", 
        time: "", 
        unread: 0, 
        online: false, 
        blocked: false,
        archived: false,
        muted: false,
        pinnedMessageId: null,
        messages: [] 
      }; 
      setChats([newChat, ...chats]); 
      handleOpenChat(newChat.id); 
    } 
    setSidebarView('main'); 
  }, [chats, handleOpenChat]);

  const handleForwardMessage = useCallback((targetChatId) => { 
    if (!forwardState.messageId || activeChatId === null || !activeChat) return; 
    const originalMsg = activeChat.messages.find(m => m.id === forwardState.messageId); 
    if (!originalMsg) return; 
    const forwardedMsg = { ...originalMsg, id: generateUUID(), sender: 'me', isForwarded: true, time: formatTime(new Date()), status: 'sent', reactions: [] }; 
    updateChatWithNewMessage(targetChatId, forwardedMsg); 
    setForwardState({ isOpen: false, messageId: null }); 
    handleOpenChat(targetChatId); 
  }, [forwardState.messageId, activeChatId, activeChat, updateChatWithNewMessage, handleOpenChat]);

  const handleMessageContextMenu = useCallback((e, messageId) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsMainMenuOpen(false); 
    setMsgContextMenu({ visible: true, x: e.clientX, y: e.clientY, messageId }); 
  }, []);

  const handleMessageAction = useCallback((action, messageId) => {
    if (activeChatId === null || !activeChat) return;
    
    if (action === 'delete' && !checkPermission(activeChat.role, 'delete')) {
        alert("You do not have permission to delete messages here.");
        setMsgContextMenu(prev => ({ ...prev, visible: false }));
        return;
    }
    if (action === 'pin' && !checkPermission(activeChat.role, 'pin')) {
        alert("You do not have permission to pin messages here.");
        setMsgContextMenu(prev => ({ ...prev, visible: false }));
        return;
    }

    switch (action) {
      case 'delete':
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: c.messages.filter(m => m.id !== messageId) } : c));
        break;
      case 'pin':
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, pinnedMessageId: c.pinnedMessageId === messageId ? null : messageId } : c));
        break;
      case 'reply':
        const msg = activeChat.messages.find(m => m.id === messageId);
        if (msg) { setReplyTo(msg); inputRef.current?.focus(); }
        break;
      case 'forward':
        setForwardState({ isOpen: true, messageId });
        break;
      case 'edit':
        const editMsg = activeChat.messages.find(m => m.id === messageId);
        if (editMsg && editMsg.sender === 'me') {
          setEditingMessageId(messageId);
          setInputText(editMsg.text || '');
          inputRef.current?.focus();
        } else {
          alert("You can only edit your own messages.");
        }
        break;
      case 'translate':
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, text: `[Translated] ${(m.text || '').split('').reverse().join('')}` } : m) } : c));
        break;
      default: break;
    }
    setMsgContextMenu(prev => ({ ...prev, visible: false }));
  }, [activeChatId, activeChat]);

  const handleChatAction = useCallback((action, chatId) => { 
    const id = chatId || chatListContextMenu.chatId;
    if (!id) return;
    setChats(prev => {
      const filteredChats = prev.filter(c => {
        if ((action === 'delete' || action === 'leave') && c.id === id) return false;
        return true;
      });
      return filteredChats.map(c => {
        if (c.id === id) {
          if (action === 'archive') return { ...c, archived: !c.archived };
          if (action === 'block') return { ...c, blocked: !c.blocked };
        }
        return c;
      });
    });
    setChatListContextMenu(prev => ({ ...prev, visible: false }));
    if (action === 'block' && isProfileOpen) setIsProfileOpen(true);
    if ((action === 'delete' || action === 'leave') && activeChatId === id) setActiveChatId(null);
  }, [chatListContextMenu.chatId, isProfileOpen, activeChatId]);

  const handleReactionClick = useCallback((emoji) => { 
    if (!msgContextMenu.messageId || activeChatId === null) return;
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgContextMenu.messageId) {
              const existingReaction = m.reactions?.find(r => r.emoji === emoji && r.me);
              let newReactions = [];
              if (existingReaction) {
                newReactions = (m.reactions || []).map(r => r.emoji === emoji ? { ...r, count: r.count - 1, me: false } : r).filter(r => r.count > 0);
              } else {
                const otherReactions = (m.reactions || []).filter(r => r.emoji !== emoji);
                const existingEmojiReaction = m.reactions?.find(r => r.emoji === emoji);
                const newCount = (existingEmojiReaction?.count || 0) + 1;
                newReactions = [...otherReactions, { emoji, count: newCount, me: true }];
              }
              return { ...m, reactions: newReactions };
            }
            return m;
          })
        };
      }
      return c;
    }));
    setMsgContextMenu(prev => ({ ...prev, visible: false }));
  }, [msgContextMenu.messageId, activeChatId]);

  useEffect(() => {
    return () => {
      chats.forEach(chat => {
        chat.messages.forEach(msg => {
          if (msg.fileUrl && msg.fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(msg.fileUrl);
          }
        });
      });
    };
  }, [chats]);

  const renderContextMenu = () => {
    if (!msgContextMenu.visible || !activeChat) return null;
    const msg = activeChat.messages.find(m => m.id === msgContextMenu.messageId);
    if (!msg) return null;
    const isMe = msg.sender === 'me';
    const canPin = checkPermission(activeChat.role, 'pin');
    const canDelete = checkPermission(activeChat.role, 'delete') || isMe;
    const isChannel = activeChat.type === 'channel';

    return (
        <div 
            className={`fixed z-50 w-48 rounded-lg shadow-xl py-1 overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            style={{ top: Math.min(msgContextMenu.y, window.innerHeight - 200), left: Math.min(msgContextMenu.x, window.innerWidth - 200) }}
            onClick={(e) => e.stopPropagation()}
        >
            {!isChannel && (
                <button onClick={() => handleMessageAction('reply', msg.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass}`}>
                    <Reply size={14} /> Reply
                </button>
            )}
            <button onClick={() => { document.execCommand('copy'); setMsgContextMenu({visible:false, x:0, y:0, messageId:null}); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass}`}>
                <Copy size={14} /> Copy
            </button>
            {canPin && (
                <button onClick={() => handleMessageAction('pin', msg.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass}`}>
                    <Pin size={14} /> Pin
                </button>
            )}
            {isMe && (
                <button onClick={() => handleMessageAction('edit', msg.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass}`}>
                    <Edit3 size={14} /> Edit
                </button>
            )}
            {canDelete && (
                <button onClick={() => handleMessageAction('delete', msg.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 text-red-500`}>
                    <Trash2 size={14} /> Delete
                </button>
            )}
        </div>
    );
  };

  const renderChatListContextMenu = () => {
    if (!chatListContextMenu.visible) return null;
    const chat = chats.find(c => c.id === chatListContextMenu.chatId);
    if (!chat) return null;

    return (
      <div 
        className={`fixed z-50 w-48 rounded-lg shadow-xl py-1 overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        style={{ top: Math.min(chatListContextMenu.y, window.innerHeight - 200), left: Math.min(chatListContextMenu.x, window.innerWidth - 200) }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => handleChatAction('archive', chat.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass}`}>
            <Archive size={14} /> {chat.archived ? 'Unarchive' : 'Archive'}
        </button>
        {chat.type === 'private' && (
            <button onClick={() => handleChatAction('block', chat.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass}`}>
                <Ban size={14} /> {chat.blocked ? 'Unblock' : 'Block'}
            </button>
        )}
        {(chat.type === 'group' || chat.type === 'channel') && (
            <button onClick={() => handleChatAction('leave', chat.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${textClass} text-red-500`}>
                <LogOut size={14} /> Leave
            </button>
        )}
        <button onClick={() => handleChatAction('delete', chat.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 text-red-500`}>
            <Trash2 size={14} /> Delete
        </button>
      </div>
    );
  };

  if (!isAuthenticated) {
      return <AuthScreen onLogin={() => setIsAuthenticated(true)} darkMode={darkMode} />;
  }

  return (
    <div className={`font-sans h-[100dvh] overflow-hidden flex justify-center items-center ${darkMode ? 'bg-[#0f0f0f]' : 'bg-gray-200'} text-gray-800`}>
      <style>{dynamicStyles}</style>

      {renderContextMenu()}
      {renderChatListContextMenu()}

      {callState.isActive && (
          <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center text-white animate-fade-in">
              <div className="absolute top-10 left-10 flex items-center gap-2"><Shield className="w-5 h-5" /> <span className="text-sm">End-to-end encrypted</span></div>
              <img src={activeChat?.avatar} className="w-32 h-32 rounded-full mb-6 border-4 border-gray-700 object-cover" />
              <h2 className="text-3xl font-bold mb-2">{activeChat?.name}</h2>
              <p className="text-gray-400 mb-12">{callState.isRinging ? "Ringing..." : "00:05"}</p>
              <div className="flex gap-16 items-center">
                  <button className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"><Mic className="w-8 h-8" /></button>
                  <button onClick={endCall} className="p-5 bg-red-500 rounded-full hover:bg-red-600 transition call-pulse"><PhoneOff className="w-10 h-10 fill-current" /></button>
                  <button className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"><VolumeX className="w-8 h-8" /></button>
              </div>
          </div>
      )}

      {viewingStory && (
          <div className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center animate-fade-in">
              <div className="absolute top-4 w-full px-4 flex gap-1"><div className="h-1 bg-white/30 flex-1 rounded overflow-hidden"><div className="h-full bg-white w-full" style={{width: `${storyProgress}%`}}></div></div></div>
              <div className="absolute top-8 left-4 flex items-center gap-2 z-10">
                  <img src={viewingStory.avatar} className="w-8 h-8 rounded-full border border-white" alt={viewingStory.user} />
                  <div>
                      <div className="text-white font-bold text-sm shadow-black drop-shadow-md">{viewingStory.user}</div>
                      <div className="text-white/70 text-xs shadow-black drop-shadow-md">{viewingStory.time}</div>
                  </div>
              </div>
              <button onClick={() => setViewingStory(null)} className="absolute top-8 right-4 text-white"><X size={24}/></button>
              <img src={viewingStory.image} className="max-h-full max-w-full object-contain" alt={`${viewingStory.user}'s story`} />
              <div className="absolute inset-0 flex"><div className="flex-1" onClick={() => setViewingStory(null)}></div><div className="flex-1" onClick={() => setViewingStory(null)}></div></div>
          </div>
      )}

      {isQRModalOpen && (
          <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
              <div className={`w-80 rounded-2xl shadow-2xl ${sidebarBg} ${textClass} p-8 flex flex-col items-center animate-zoom-in relative`}>
                  <button onClick={() => setIsQRModalOpen(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
                  <div className="w-20 h-20 rounded-full mb-4 border-4 border-white shadow-lg overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-accent text-white">{myProfile.name[0]}</div>
                  </div>
                  <h3 className="font-bold text-xl mb-1">{myProfile.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{myProfile.username}</p>
                  <div className="bg-white p-4 rounded-xl"><QrCode size={150} color="black" /></div>
                  <p className="text-xs text-gray-400 mt-4 text-center">Scan this code to add me on Telegram</p>
              </div>
          </div>
      )}

      {lockModalOpen && (
          <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
              <div className={`w-[90%] max-w-sm rounded-xl shadow-2xl ${sidebarBg} ${textClass} p-6 flex flex-col items-center`}>
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><Lock className="w-8 h-8 text-gray-500" /></div>
                  <h3 className="font-bold text-lg mb-2">Folder Locked</h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">Enter passcode to view this folder</p>
                  <input autoFocus type="password" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} className={`w-full p-2 text-center text-xl tracking-widest rounded-xl border outline-none mb-4 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50'}`} maxLength={4} />
                  <div className="flex gap-2 w-full">
                      <button onClick={() => { setLockModalOpen(false); setPasscodeInput(""); }} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition duration-200">Cancel</button>
                      <button onClick={handleUnlockFolder} className="flex-1 py-2 text-white rounded-xl font-bold bg-accent transition duration-200">Unlock</button>
                  </div>
              </div>
          </div>
      )}

      {isDrawingOpen && (
          <div className="fixed inset-0 z-[90] bg-black/80 flex flex-col items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col relative w-full max-w-lg animate-zoom-in">
                  <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => { const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height); } }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition duration-200"><Trash2 size={20} className="text-red-500"/></button>
                      <button onClick={() => setIsDrawingOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition duration-200"><X size={20}/></button>
                  </div>
                  <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={finishDrawing} className="cursor-crosshair bg-white w-full h-[400px]" />
                  <div className="p-4 bg-gray-100 flex justify-between items-center">
                      <div className="flex gap-2">
                          {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map(color => (
                              <button key={color} onClick={() => setDrawingColor(color)} className={`w-8 h-8 rounded-full border-2 transition duration-200 ${drawingColor === color ? 'border-gray-600 scale-110' : 'border-white'}`} style={{backgroundColor: color}} />
                          ))}
                      </div>
                      <button onClick={sendDrawing} className="px-6 py-2 bg-accent text-white rounded-full font-bold hover:opacity-90 flex items-center gap-2 transition duration-200"><Send size={18} /> Send</button>
                  </div>
              </div>
          </div>
      )}

      {pollModalOpen && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
              <div className={`w-[90%] max-w-sm rounded-xl shadow-2xl ${sidebarBg} ${textClass} animate-zoom-in`}>
                  <div className={`p-4 border-b flex justify-between items-center ${borderClass}`}><h3 className="font-bold">Create Poll</h3><button onClick={() => setPollModalOpen(false)}><X className={subTextClass} /></button></div>
                  <div className="p-4 flex flex-col gap-3">
                      <input type="text" placeholder="Ask a question..." value={pollData.question} onChange={(e) => setPollData({...pollData, question: e.target.value})} className={`w-full p-2 rounded-lg border outline-none ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50'}`}/>
                      {pollData.options.map((opt, i) => (
                        <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e) => { const newOpts = [...pollData.options]; newOpts[i] = e.target.value; setPollData({...pollData, options: newOpts}); }} className={`w-full p-2 rounded-lg border outline-none ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50'}`} />
                      ))}
                      <button onClick={() => setPollData({...pollData, options: [...pollData.options, '']})} className="text-sm flex items-center gap-1 font-medium hover-bg-accent w-max px-2 py-1 rounded-lg text-accent transition duration-200"><Plus size={16} /> Add Option</button>
                      <button onClick={handleCreatePoll} className="w-full text-white py-2 rounded-lg mt-2 font-bold hover:opacity-90 bg-accent transition duration-200">Create</button>
                  </div>
              </div>
          </div>
      )}

      {folderModalOpen && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
              <div className={`w-[90%] max-w-sm rounded-xl shadow-2xl ${sidebarBg} ${textClass} animate-zoom-in`}>
                  <div className={`p-4 border-b flex justify-between items-center ${borderClass}`}><h3 className="font-bold">New Folder</h3><button onClick={() => setFolderModalOpen(false)}><X className={subTextClass} /></button></div>
                  <div className="p-4 flex flex-col gap-3">
                      <input type="text" value={newFolderData.name} onChange={e => setNewFolderData({...newFolderData, name: e.target.value})} className={`w-full p-2 rounded-lg border outline-none ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50'}`} placeholder="Folder Name" />
                      <div className="flex gap-2">
                          {['all', 'private', 'group'].map(type => (
                              <button key={type} onClick={() => setNewFolderData({...newFolderData, type})} className={`flex-1 py-2 text-xs font-bold rounded-lg border capitalize transition duration-200 ${newFolderData.type === type ? 'text-white bg-accent border-accent' : `${darkMode ? 'border-gray-600' : 'border-gray-200'} ${subTextClass}`}`}>{type}</button>
                          ))}
                      </div>
                      <button onClick={handleCreateFolder} className="w-full text-white py-2 rounded-lg mt-4 font-bold hover:opacity-90 bg-accent transition duration-200">Create Folder</button>
                  </div>
              </div>
          </div>
      )}

      <div className={`w-full h-full relative flex shadow-2xl overflow-hidden md:max-w-[1600px] md:h-full ${sidebarBg}`}>
        
        {/* --- LEFT SIDEBAR --- */}
        <div className={`h-full flex flex-col z-20 ${borderClass} ${sidebarBg} md:border-r transition-all duration-300 ${activeChatId !== null ? 'hidden md:flex md:w-[380px] lg:w-[420px]' : 'w-full'} relative`}>
          <header className="px-3 pt-2 pb-2 flex flex-col gap-2 shrink-0 relative">
             <div className="flex gap-3 items-center w-full">
                {sidebarView !== 'main' ? (
                    <button onClick={() => setSidebarView('main')} className={`p-2 rounded-full transition duration-200 ${hoverClass} ${subTextClass}`}><ArrowLeft className="w-6 h-6" /></button>
                ) : (
                    <button onClick={(e) => { e.stopPropagation(); setIsMainMenuOpen(!isMainMenuOpen); }} className={`p-2 rounded-full transition duration-200 ${isMainMenuOpen ? 'bg-gray-100 text-accent' : subTextClass} ${hoverClass}`}><Menu className="w-6 h-6" /></button>
                )}
                <div className={`flex-1 rounded-full flex items-center px-4 py-2 border border-transparent focus-within-border-accent transition duration-200 group ${darkMode ? 'bg-[#1c1c1d] border-gray-700' : 'bg-gray-100'}`}>
                    <Search className="w-5 h-5 text-gray-400 group-focus-text-accent" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className={`bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-500 min-w-0 ${textClass}`}/>
                </div>
             </div>

             {sidebarView === 'main' && (
                 <div className="flex gap-4 overflow-x-auto no-scrollbar mt-1 pb-2 px-1">
                     <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group">
                         <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-accent transition duration-200"><Plus size={24}/></div>
                         <span className="text-xs text-gray-500 font-medium">My Story</span>
                     </div>
                     {MOCK_STORIES.map(story => (
                         <div key={story.id} onClick={() => setViewingStory(story)} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer">
                             <div className={`w-14 h-14 rounded-full p-[2px] transition duration-200 transform hover:scale-105 ${story.viewed ? 'bg-gray-300' : 'bg-accent'}`}>
                                 <img src={story.avatar} className={`w-full h-full rounded-full border-2 ${darkMode ? 'border-[#1c1c1d]' : 'border-white'} object-cover`} alt={story.user} />
                             </div>
                             <span className={`text-xs font-medium ${textClass}`}>{story.user}</span>
                         </div>
                     ))}
                 </div>
             )}

             {sidebarView === 'main' && (
                 <div className="flex items-center gap-4 overflow-x-auto no-scrollbar mt-1 border-b border-gray-100 pb-0 px-2">
                     {folders.map(folder => (
                         <button key={folder.id} onClick={() => handleFolderClick(folder.id)} className={`pb-2 text-sm font-medium transition duration-200 whitespace-nowrap flex items-center gap-1 border-b-2 ${activeFolder === folder.id ? 'border-accent text-accent' : `border-transparent ${subTextClass} hover:text-gray-700`}`}>
                             {folder.locked && <Lock size={12} />}
                             {folder.name}
                         </button>
                     ))}
                     <button onClick={() => setFolderModalOpen(true)} className={`pb-2 ${subTextClass} ${hoverClass} rounded-t-lg px-2 transition duration-200`}><FolderPlus size={16} /></button>
                 </div>
             )}

            {isMainMenuOpen && sidebarView === 'main' && (
              <div className={`absolute top-14 left-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] border w-64 py-2 z-50 animate-scale-in origin-top-left flex flex-col ${sidebarBg} ${borderClass}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { handleOpenChat(0); setIsMainMenuOpen(false); }} className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Bookmark className="w-5 h-5 text-gray-500" /> Saved Messages</button>
                <button onClick={() => { setSidebarView('archived'); setIsMainMenuOpen(false); }} className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Archive className="w-5 h-5 text-gray-500" /> Archived Chats</button>
                <button onClick={() => { setSidebarView('contacts'); setIsMainMenuOpen(false); }} className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Users className="w-5 h-5 text-gray-500" /> Contacts</button>
                <button onClick={() => { setSidebarView('settings'); setIsMainMenuOpen(false); }} className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Settings className="w-5 h-5 text-gray-500" /> Settings</button>
                <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-4 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}>{darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />} {darkMode ? "Light Mode" : "Night Mode"}</button>
              </div>
            )}
          </header>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
              {sidebarView === 'main' || sidebarView === 'archived' ? (
                <>
                  {visibleChats.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                          {activeFolder === 'Personal' && folders.find(f => f.id === 'Personal')?.locked && !unlockedFolders.includes('Personal') ? (
                              <div className="text-center"><Lock size={40} className="mx-auto mb-2 opacity-50" /><p>This folder is locked</p></div>
                          ) : (
                              <p>No chats found</p>
                          )}
                      </div>
                  )}
                  {visibleChats.map((chat) => (
                    <div key={chat.id} onClick={() => handleOpenChat(chat.id)} onContextMenu={(e) => { e.preventDefault(); setChatListContextMenu({visible: true, x: e.clientX, y: e.clientY, chatId: chat.id}); }} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition duration-200 select-none ${activeChatId === chat.id ? 'bg-accent text-white' : hoverClass}`}>
                        <div className="relative shrink-0">
                           {chat.id === 0 ? <div className="w-12 h-12 rounded-full flex items-center justify-center bg-accent"><Bookmark className="w-6 h-6 text-white" /></div> : chat.id === 99 ? <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500"><Bot className="w-6 h-6 text-white" /></div> : chat.avatar === 'group' ? <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center"><Users className="w-6 h-6 text-white" /></div> : chat.avatar === 'channel' ? <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center"><Megaphone className="w-6 h-6 text-white" /></div> : <img src={chat.avatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover" alt={chat.name} />}
                           {chat.online && <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${activeChatId === chat.id ? 'bg-white border-accent' : 'bg-green-500 border-white'}`}></div>}
                        </div>
                        <div className={`flex-1 min-w-0 border-b pb-2 ml-1 h-full flex flex-col justify-center ${borderClass} ${activeChatId === chat.id ? 'border-transparent' : ''}`}>
                            <div className="flex justify-between items-baseline">
                                <h3 className={`font-semibold text-[15px] truncate flex items-center gap-1 min-w-0 ${activeChatId === chat.id ? 'text-white' : textClass}`}>{chat.name} {chat.blocked && <Ban className="w-3 h-3 text-red-500" />} {chat.muted && <VolumeX className="w-3 h-3 opacity-50" />} {chat.verified && <CheckCircle size={12} className="text-blue-500 fill-white" />}</h3>
                                <span className={`text-xs ${activeChatId === chat.id ? 'text-white/80' : subTextClass}`}>{chat.time}</span>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                <p className={`text-[14px] truncate flex-1 min-w-0 ${activeChatId === chat.id ? 'text-white/80' : subTextClass}`}>{formatPreviewMessage(chat.lastMessage, chat.messages[0]?.type)}</p>
                                {chat.unread > 0 && <div className={`min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full flex items-center justify-center ml-2 ${activeChatId === chat.id ? 'bg-white text-accent' : 'text-white'}`} style={activeChatId !== chat.id ? {backgroundColor: '#c4c9cc'} : {}}>{chat.unread}</div>}
                            </div>
                        </div>
                    </div>
                  ))}
                </>
              ) : sidebarView === 'contacts' ? (
                  <div className="p-2">
                      <div className={`px-4 py-2 text-sm font-bold ${subTextClass} uppercase`}>Contacts</div>
                      {MOCK_CONTACTS.map(contact => (
                          <div key={contact.id} onClick={() => handleStartContactChat(contact)} className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg ${hoverClass}`}><img src={contact.avatar} className="w-10 h-10 rounded-full bg-gray-200" alt={contact.name} /><div><h3 className={`font-medium ${textClass}`}>{contact.name}</h3><p className={`text-xs ${subTextClass}`}>{contact.bio}</p></div></div>
                      ))}
                  </div>
              ) : sidebarView === 'settings' ? (
                  <div className="p-0">
                      <div className="flex flex-col items-center py-6 border-b border-gray-200"><div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 bg-accent">{myProfile.name[0]}</div>
                          {isEditingProfile ? (
                              <div className="flex flex-col gap-2 w-3/4">
                                <input type="text" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="border p-1 rounded" />
                                <input type="text" value={tempProfile.bio} onChange={e => setTempProfile({...tempProfile, bio: e.target.value})} className="border p-1 rounded text-sm" />
                                <div className="flex gap-2 justify-center mt-2">
                                  <button onClick={handleSaveSettings} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Save</button>
                                  <button onClick={() => setIsEditingProfile(false)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancel</button>
                                </div>
                              </div>
                          ) : (
                              <><h2 className={`text-xl font-bold ${textClass}`}>{myProfile.name}</h2><p className={subTextClass}>{myProfile.phone}</p><p className={`text-sm mt-1 ${textClass}`}>"{myProfile.bio}"</p><button onClick={() => { setTempProfile(myProfile); setIsEditingProfile(true); }} className="mt-3 text-sm flex items-center gap-1 text-accent"><Edit2 size={14} /> Edit Profile</button></>
                          )}
                      </div>
                      <div className="p-4 border-b border-gray-100">
                          <div className={`text-xs font-bold ${subTextClass} uppercase mb-2`}>Accent Color</div>
                          <div className="flex gap-2 justify-center">
                              {ACCENT_COLORS.map(color => (
                                  <button key={color.value} onClick={() => setAccentColor(color.value)} className={`w-8 h-8 rounded-full border-2 transition duration-200 ${accentColor === color.value ? 'border-gray-600 scale-110' : 'border-transparent'}`} style={{backgroundColor: color.value}}></button>
                              ))}
                          </div>
                      </div>
                      <div className="p-2">
                        <div className={`flex items-center gap-4 px-4 py-3 ${hoverClass} cursor-pointer`}><Bell className="w-5 h-5 text-gray-500" /> <span className={textClass}>Notifications</span></div>
                        <div className={`flex items-center gap-4 px-4 py-3 ${hoverClass} cursor-pointer`}><Lock className="w-5 h-5 text-gray-500" /> <span className={textClass}>Privacy and Security</span></div>
                        <div className={`flex items-center gap-4 px-4 py-3 ${hoverClass} cursor-pointer`} onClick={() => setIsQRModalOpen(true)}><QrCode className="w-5 h-5 text-gray-500" /> <span className={textClass}>QR Code</span></div>
                      </div>
                  </div>
              ) : null}
          </div>

          <button onClick={(e) => { e.stopPropagation(); setIsCreateMenuOpen(!isCreateMenuOpen); }} className={`absolute bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 hover:scale-105 transition duration-200 z-50`}>
               <Edit2 className="w-6 h-6" />
          </button>

          {isCreateMenuOpen && (
                <div className={`absolute bottom-24 right-6 rounded-xl shadow-xl border w-48 py-2 z-50 animate-scale-in origin-bottom-right flex flex-col ${sidebarBg} ${borderClass}`} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleCreateChat('group')} className={`flex items-center gap-3 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Users className="w-4 h-4 text-gray-500" /> New Group</button>
                    <button onClick={() => handleCreateChat('channel')} className={`flex items-center gap-3 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><Megaphone className="w-4 h-4 text-gray-500" /> New Channel</button>
                    <button onClick={() => { setSidebarView('contacts'); setIsCreateMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 transition duration-200 text-[15px] ${hoverClass} ${textClass}`}><UserPlus className="w-4 h-4 text-gray-500" /> New Chat</button>
                </div>
          )}
        </div>

        {/* --- MAIN CHAT AREA --- */}
        <div className={`flex-1 flex-col relative bg-[#0e1621] ${activeChatId === null ? 'hidden md:flex' : 'flex w-full fixed inset-0 md:static z-30'}`}>
          {activeChat ? (
            <>
              <header className={`px-4 py-2 flex items-center justify-between shadow-sm z-10 shrink-0 h-[60px] ${sidebarBg}`}>
                <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <button onClick={(e) => { e.stopPropagation(); handleCloseChat(); }} className="md:hidden text-gray-500"><ArrowLeft /></button>
                  {activeChatId === 0 ? <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent flex-shrink-0"><Bookmark className="text-white w-5 h-5" /></div> : activeChat.id === 99 ? <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 flex-shrink-0"><Bot className="text-white w-5 h-5" /></div> : activeChat.avatar === 'group' ? <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-white" /></div> : activeChat.avatar === 'channel' ? <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Megaphone className="w-5 h-5 text-white" /></div> : <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={activeChat.name} />}
                  <div className="flex flex-col min-w-0">
                    <h2 className={`font-bold text-[16px] leading-tight truncate ${textClass}`}>{activeChat.name} {activeChat.verified && <CheckCircle size={12} className="text-blue-500 inline-block ml-1 fill-white" />}</h2>
                    {activeChatId !== 0 && <span className={`text-[13px] truncate ${activeChat.online ? 'text-accent' : 'text-gray-500'}`}>
                        {activeChat.id === 0 ? 'Cloud Storage' :
                         activeChat.blocked ? <span className="text-red-500 font-bold">Blocked</span> : 
                         isTyping && activeChat.type !== 'bot' ? 'typing...' : 
                         activeChat.type === 'bot' ? 'bot' : 
                         activeChat.type === 'group' ? `${activeChat.members} members` : 
                         activeChat.type === 'channel' ? `${activeChat.subscribers} subscribers` : 
                         activeChat.online ? 'online' : activeChat.lastSeen || 'last seen recently'}
                    </span>}
                  </div>
                </div>
                <div className="flex gap-4 text-gray-500 items-center flex-shrink-0">
                    {isChatSearchOpen ? <div className="flex items-center bg-gray-100 rounded-full px-3 py-1"><input autoFocus value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} className="bg-transparent outline-none text-sm w-32" placeholder="Search..." /><button onClick={() => setIsChatSearchOpen(false)}><X className="w-4 h-4" /></button></div> : <button onClick={() => setIsChatSearchOpen(true)} className={`hover-text-accent`}><Search className="w-5 h-5" /></button>}
                    {!['channel', 'bot'].includes(activeChat.type) && activeChat.id !== 0 && (
                        <button onClick={() => startCall('audio')} className={`hover-text-accent`}><Phone className="w-5 h-5" /></button>
                    )}
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`hover-text-accent hidden md:block`}><Info className="w-5 h-5" /></button>
                    <button className={`hover-text-accent`}><MoreVertical className="w-5 h-5" /></button>
                </div>
              </header>

              {pinnedMessage && (
                  <div className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-sm cursor-pointer z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center gap-3 overflow-hidden min-w-0"><div className="w-0.5 h-8 rounded-full bg-accent flex-shrink-0"></div><div className="flex flex-col min-w-0"><span className="font-semibold text-xs text-accent">Pinned Message</span><span className={`truncate ${subTextClass} text-xs`}>{getMessageText(pinnedMessage)}</span></div></div>
                      <button onClick={() => handleMessageAction('pin', pinnedMessage.id)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
              )}

              <div className="flex-1 overflow-y-auto p-2 relative bg-[#99ba92]">
                <div className="absolute inset-0 opacity-40 pointer-events-none telegram-bg" style={{backgroundColor: darkMode ? '#0f0f0f' : '#7a8c76'}}></div>
                <div className="relative z-0 max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-2">
                    {Object.entries(groupMessagesByDate(activeChat.messages)).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center my-2 sticky top-2 z-10"><span className="bg-black/20 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">{date}</span></div>
                            {msgs.filter(m => !chatSearchQuery || (typeof m.text === 'string' && m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))).map((msg) => {
                                const isMe = msg.sender === 'me';
                                return (
                                    <div key={msg.id} onContextMenu={(e) => handleMessageContextMenu(e, msg.id)} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-1 group animate-message`}>
                                        <div className={`relative max-w-[85%] px-3 py-1.5 shadow-sm text-[15px] rounded-lg ${isMe ? `${myBubble} rounded-tr-none bg-accent` : `${theirBubble} rounded-tl-none`}`} style={isMe && darkMode ? {backgroundColor: '#766ac8'} : {}}>
                                            {!isMe && activeChat.type === 'group' && <div className="text-xs text-[#e17076] font-semibold mb-0.5">{msg.senderName || activeChat.name}</div>}
                                            {msg.isForwarded && <div className="text-xs font-medium mb-1 flex items-center gap-1 text-accent"><Forward size={12}/> Forwarded message</div>}
                                            {msg.replyTo && <div className={`mb-1 pl-2 border-l-2 text-xs opacity-80 cursor-pointer border-accent`} style={isMe ? {borderColor: 'rgba(255,255,255,0.6)'} : {}}><div className={`font-semibold`} style={{color: isMe ? 'white' : accentColor}}>{msg.replyTo.sender === 'me' ? 'You' : activeChat.name}</div><div className="truncate">{msg.replyTo.text}</div></div>}
                                            
                                            {msg.selfDestructTime && msg.selfDestructTime > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-red-500 mb-1 font-bold"><Flame size={12} className="animate-pulse" /> Self-destructing</div>
                                            )}

                                            {msg.type === 'image' && msg.fileUrl ? (
                                                <img src={msg.fileUrl} className="rounded-lg mb-1 max-w-full max-h-64 object-cover" alt="Shared image" />
                                            ) : msg.type === 'sticker' ? (
                                                <img src={msg.fileUrl} className="w-32 h-32 mb-1" alt="Sticker" />
                                            ) : msg.type === 'gif' ? (
                                                <img src={msg.fileUrl} className="rounded-lg mb-1 max-w-full max-h-48 object-cover" alt="GIF" />
                                            ) : msg.type === 'poll' ? (
                                                <div className="min-w-[200px] sm:min-w-[250px]">
                                                    <div className="font-bold mb-2">{msg.question}</div>
                                                    <div className="flex flex-col gap-2">
                                                        {msg.options?.map(opt => (
                                                            <button key={opt.id} onClick={() => handleVote(msg.id, opt.id)} className={`relative overflow-hidden w-full text-left px-3 py-2 rounded border transition ${opt.voted ? 'border-accent' : 'border-transparent bg-black/5 hover:bg-black/10'}`}>
                                                                {opt.voted && <div className="absolute inset-0 opacity-20 bg-accent" style={{width: `${(opt.votes / Math.max(1, (msg.options?.reduce((a,b) => a + b.votes, 0) || 0))) * 100}%`}}></div>}
                                                                <div className="relative flex justify-between z-10"><span>{opt.text}</span>{opt.voted && <CheckCircle size={16} className="text-accent" />}</div>
                                                                <div className="relative z-10 text-xs opacity-70 mt-1">{Math.round((opt.votes / Math.max(1, (msg.options?.reduce((a,b) => a + b.votes, 0) || 0))) * 100)}% ({opt.votes})</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs opacity-60 mt-2">{msg.options?.reduce((a,b) => a + b.votes, 0) || 0} votes</div>
                                                </div>
                                            ) : msg.type === 'game' ? (
                                                <div className="min-w-[200px] flex flex-col items-center p-2 bg-black/5 rounded">
                                                    <div className="font-bold mb-2 flex items-center gap-2"><Gamepad2 size={16}/> Tic Tac Toe</div>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        {msg.gameState?.board.map((cell, i) => (
                                                            <button key={i} onClick={() => handleGameMove(msg.id, i)} disabled={!!cell || !!msg.gameState?.winner} className="w-12 h-12 bg-white rounded flex items-center justify-center text-xl font-bold border border-gray-200 text-black">{cell}</button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 text-xs font-bold">{msg.gameState?.winner ? `Winner: ${msg.gameState.winner}!` : `Next: ${msg.gameState?.xIsNext ? 'X' : 'O'}`}</div>
                                                </div>
                                            ) : (
                                                <div className="mr-8 pb-1 inline-block break-words selection-accent">
                                                    <RichTextRenderer text={getMessageText(msg)} />
                                                </div>
                                            )}
                                            
                                            <div className="float-right flex items-center gap-1 ml-2 mt-2 select-none h-3 relative top-0.5">
                                                {msg.isEdited && <span className={`text-[10px] ${subTextClass}`}>edited</span>}
                                                <span className={`text-[11px] ${isMe ? 'text-green-800/60' : 'text-gray-400'} ${darkMode && isMe ? 'text-gray-300' : ''}`}>{msg.time.split(' ')[0]}</span>
                                                {isMe && (
                                                    activeChat.id === 0 ? <CheckCheck className={`w-3.5 h-3.5 ${darkMode ? 'text-blue-300' : 'text-[#53bdeb]'}`} /> :
                                                    activeChat.type === 'channel' ? null :
                                                    (msg.status === 'read' ? <CheckCheck className={`w-3.5 h-3.5 ${darkMode ? 'text-blue-300' : 'text-[#53bdeb]'}`} /> : <Check className="w-3.5 h-3.5 text-gray-400" />)
                                                )}
                                                {activeChat.type === 'channel' && msg.views && msg.views > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 ml-1">
                                                        <Eye size={10} /> {msg.views > 1000 ? (msg.views/1000).toFixed(1) + 'k' : msg.views}
                                                    </span>
                                                )}
                                            </div>
                                            {msg.reactions && msg.reactions.length > 0 && <div className={`absolute -bottom-5 ${isMe ? 'right-0' : 'left-0'} flex gap-1 z-10`}>{msg.reactions.map((r, i) => (<button key={i} onClick={(e) => {e.stopPropagation(); handleReactionClick(r.emoji)}} className="bg-white border px-1.5 rounded-full text-xs shadow-sm text-black">{r.emoji} {r.count > 1 && r.count}</button>))}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-1 px-4 py-2 bg-white w-max rounded-lg rounded-tl-none shadow-sm ml-2 animate-message">
                            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
              </div>

              {activeChat.blocked ? (
                  <div className={`p-4 text-center border-t ${sidebarBg} ${borderClass}`}><div className="text-red-500 font-medium">You blocked this user</div><button onClick={() => handleChatAction('block', activeChat.id)} className="text-sm mt-1 hover:underline text-accent">Unblock</button></div>
              ) : activeChat.type === 'channel' && activeChat.role !== 'admin' ? (
                  <div className={`p-3 border-t flex justify-center ${sidebarBg} ${borderClass}`}>
                      <button onClick={handleMuteToggle} className={`px-8 py-2 rounded-lg text-sm font-medium uppercase transition ${activeChat.muted ? 'text-accent bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>{activeChat.muted ? 'Unmute' : 'Mute'}</button>
                  </div>
              ) : (
                <div className={`px-2 py-2 z-10 max-w-[100%] mx-auto w-full md:px-[10%] ${sidebarBg} relative`}>
                    {/* ... (Input areas unchanged) ... */}
                    {editingMessageId && <div className={`flex items-center justify-between px-4 py-2 border-l-2 mb-2 border-accent ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}><div className="flex flex-col text-sm ml-2"><span className="font-semibold flex items-center gap-1 text-accent"><Edit3 size={14} /> Edit Message</span><span className="text-gray-500 truncate">{chats.find(c => c.id === activeChatId)?.messages.find(m => m.id === editingMessageId)?.text}</span></div><button onClick={() => { setEditingMessageId(null); setInputText(""); }}><X className="w-4 h-4" /></button></div>}
                    {replyTo && <div className={`flex items-center justify-between px-4 py-2 border-l-2 mb-2 border-accent ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}><div className="flex flex-col text-sm ml-2"><span className="font-semibold text-accent">Reply to {replyTo.sender === 'me' ? 'You' : activeChat.name}</span><span className="text-gray-500 truncate">{replyTo.text}</span></div><button onClick={() => setReplyTo(null)}><X className="w-4 h-4" /></button></div>}
                    
                    {isAttachMenuOpen && (
                        <div className={`absolute bottom-16 left-2 w-48 rounded-xl shadow-xl border py-2 z-50 animate-scale-in flex flex-col ${sidebarBg} ${borderClass}`}>
                            <button onClick={() => { fileInputRef.current?.click(); setIsAttachMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><ImageIcon className="w-5 h-5 text-blue-500" /> Photo or Video</button>
                            <button onClick={() => { setIsDrawingOpen(true); setIsAttachMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><PenTool className="w-5 h-5 text-orange-500" /> Draw</button>
                            <button onClick={() => { handleSendMessage('', 'game'); setIsAttachMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><Gamepad2 className="w-5 h-5 text-purple-500" /> Game</button>
                            <button className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><Film className="w-5 h-5 text-blue-400" /> File</button>
                            <button onClick={() => { setInputText(prev => prev + " ||spoiler||"); setIsAttachMenuOpen(false); inputRef.current?.focus(); }} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><Eye className="w-5 h-5 text-gray-500" /> Spoiler</button>
                            {activeChat.type === 'group' && (
                                <button onClick={() => { setPollModalOpen(true); setIsAttachMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><BarChart2 className="w-5 h-5 text-yellow-500" /> Poll</button>
                            )}
                        </div>
                    )}

                    {isTimerMenuOpen && (
                        <div className={`absolute bottom-16 right-12 w-32 rounded-xl shadow-xl border py-2 z-50 animate-scale-in flex flex-col ${sidebarBg} ${borderClass}`}>
                            <div className="px-4 py-1 text-xs text-gray-500 font-bold uppercase">Self-Destruct</div>
                            {[0, 5, 10, 30, 60].map(time => (
                                <button key={time} onClick={() => { setSelfDestructTime(time); setIsTimerMenuOpen(false); }} className={`flex items-center justify-between px-4 py-2 text-sm ${hoverClass} ${textClass}`}><span>{time === 0 ? "Off" : `${time}s`}</span>{selfDestructTime === time && <Check size={14} className="text-accent" />}</button>
                            ))}
                        </div>
                    )}

                    {isScheduleMenuOpen && (
                        <div className={`absolute bottom-16 right-4 w-48 rounded-xl shadow-xl border py-2 z-50 animate-scale-in flex flex-col ${sidebarBg} ${borderClass}`}>
                             <button onClick={() => handleSendMessage(inputText, 'text', true)} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><Clock size={16} /> Schedule Message</button>
                             <button onClick={() => handleSendMessage(inputText, 'text')} className={`flex items-center gap-3 px-4 py-2.5 transition text-[15px] ${hoverClass} ${textClass}`}><Send size={16} /> Send Now</button>
                        </div>
                    )}

                    {showEmojiPicker && (
                      <div className={`absolute bottom-full left-0 mb-2 rounded-xl shadow-xl border w-80 h-72 overflow-hidden flex flex-col animate-scale-in z-50 ${sidebarBg} ${borderClass}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex border-b">
                            {['emoji', 'sticker', 'gif'].map(tab => (
                                <button key={tab} onClick={() => setPickerTab(tab)} className={`flex-1 py-2 text-xs font-bold uppercase ${pickerTab === tab ? 'border-b-2 border-accent text-accent' : 'text-gray-500'}`}>{tab}</button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {pickerTab === 'emoji' && <div className="grid grid-cols-8 gap-1">{COMMON_EMOJIS.map((emoji) => <button key={emoji} onClick={() => { setInputText(prev => prev + emoji); inputRef.current?.focus(); }} className={`w-8 h-8 flex items-center justify-center text-xl rounded-md transition ${hoverClass}`}>{emoji}</button>)}</div>}
                            {pickerTab === 'sticker' && <div className="grid grid-cols-3 gap-2">{STICKERS.map((s, i) => <img key={i} src={s} onClick={() => handleSendMessage(s, 'sticker')} className="w-full h-auto cursor-pointer hover:scale-105 transition" alt={`Sticker ${i + 1}`} />)}</div>}
                            {pickerTab === 'gif' && <div className="grid grid-cols-2 gap-2">{GIFS.map((g, i) => <img key={i} src={g} onClick={() => handleSendMessage(g, 'gif')} className="w-full h-auto rounded cursor-pointer hover:scale-105 transition" alt={`GIF ${i + 1}`} />)}</div>}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-end gap-2 w-full">
                        <button onClick={(e) => { e.stopPropagation(); setIsAttachMenuOpen(!isAttachMenuOpen); }} className={`p-3 text-gray-500 hover:bg-gray-100 rounded-full transition transform ${isAttachMenuOpen ? 'rotate-45' : ''}`}><Paperclip className="w-6 h-6" /></button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                        <div className={`flex-1 relative rounded-2xl flex items-center pr-2 ${darkMode ? 'bg-[#1c1c1d]' : 'bg-white'}`}>
                            <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={editingMessageId ? "Edit message..." : "Message"} className={`flex-1 bg-transparent border-none outline-none px-4 py-3 min-w-0 ${textClass}`} />
                            <button onClick={(e) => { e.stopPropagation(); setIsTimerMenuOpen(!isTimerMenuOpen); }} className={`p-1.5 rounded-full hover:bg-gray-200 transition ${selfDestructTime > 0 ? 'text-red-500' : 'text-gray-400'}`}><Clock size={18} /></button>
                        </div>
                        {inputText || selectedFile ? (
                            <button onClick={() => handleSendMessage()} onContextMenu={(e) => { e.preventDefault(); setIsScheduleMenuOpen(!isScheduleMenuOpen); }} className="p-3 hover:opacity-90 rounded-full text-white bg-accent">{editingMessageId ? <Check className="w-6 h-6" /> : <Send className="w-6 h-6 fill-current" />}</button>
                        ) : (
                            <button onClick={() => setIsRecording(!isRecording)} className={`p-3 rounded-full ${isRecording ? 'text-red-500 bg-red-50' : 'text-gray-500'}`}><Mic className="w-6 h-6" /></button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} className={`p-3 transition rounded-full shrink-0 ${hoverClass} ${showEmojiPicker ? 'text-accent' : 'text-gray-400 hover:text-gray-500'}`}><Smile className="w-6 h-6" /></button>
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

        {isProfileOpen && activeChat && activeChatId !== 0 && (
            <div className={`fixed inset-0 z-50 md:relative md:z-20 md:w-[300px] border-l flex flex-col animate-scale-in ${sidebarBg} ${borderClass}`}>
                <div className="flex items-center gap-4 p-4 border-b">
                    <button onClick={() => setIsProfileOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
                    <span className={`font-semibold ${textClass}`}>{activeChat.type === 'private' ? 'User Info' : activeChat.type === 'group' ? 'Group Info' : activeChat.type === 'bot' ? 'Bot Info' : 'Channel Info'}</span>
                </div>
                
                <div className="p-6 flex flex-col items-center border-b">
                      <div className="w-24 h-24 rounded-full mb-4 overflow-hidden relative">
                          {activeChat.avatar === 'group' ? ( <div className="w-full h-full bg-orange-400 flex items-center justify-center"><Users className="w-12 h-12 text-white" /></div> ) : activeChat.avatar === 'channel' ? ( <div className="w-full h-full bg-blue-500 flex items-center justify-center"><Megaphone className="w-12 h-12 text-white" /></div> ) : activeChat.type === 'bot' ? ( <div className="w-full h-full bg-blue-500 flex items-center justify-center"><Bot className="w-12 h-12 text-white" /></div> ) : ( <img src={activeChat.avatar} className="w-full h-full object-cover" alt={activeChat.name} /> )}
                      </div>
                    <h2 className={`text-xl font-bold ${textClass}`}>{activeChat.name} {activeChat.verified && <CheckCircle size={16} className="text-blue-500 inline-block ml-1 fill-white" />}</h2>
                    <span className="text-gray-500 text-sm">{activeChat.online ? 'online' : activeChat.type === 'private' ? 'last seen recently' : activeChat.type === 'bot' ? 'bot' : activeChat.type === 'group' ? `${activeChat.members} members` : `${activeChat.subscribers} subscribers`}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 flex flex-col gap-4 border-b">
                        {activeChat.type === 'channel' && activeChat.description && (
                            <div className="flex gap-4"><Info className="w-6 h-6 text-gray-400 flex-shrink-0" /><div><p className={textClass}>{activeChat.description}</p><span className="text-xs text-gray-400">Description</span></div></div>
                        )}
                        {activeChat.type === 'channel' && activeChat.link && (
                            <div className="flex gap-4 items-center cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded"><LinkIcon className="w-6 h-6 text-gray-400 flex-shrink-0" /><div className="flex-1 min-w-0"><p className={`text-accent truncate`}>{activeChat.link}</p><span className="text-xs text-gray-400">Link</span></div><Copy className="w-4 h-4 text-gray-400" /></div>
                        )}
                        <div className="flex gap-4 items-center justify-between cursor-pointer"><div className="flex gap-4 items-center"><Bell className="w-6 h-6 text-gray-400" /><span className={textClass}>Notifications</span></div><div className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${activeChat.muted ? 'bg-gray-300' : 'bg-accent'}`} onClick={handleMuteToggle}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${activeChat.muted ? '' : 'translate-x-5'}`}></div></div></div>
                        {activeChat.type === 'private' && activeChat.id !== 0 && ( <div className="flex gap-4 items-center cursor-pointer mt-2" onClick={() => handleChatAction('block', activeChat.id)}><Ban className={`w-6 h-6 ${activeChat.blocked ? 'text-red-500' : 'text-gray-400'}`} /><span className={activeChat.blocked ? 'text-red-500' : textClass}>{activeChat.blocked ? 'Unblock User' : 'Block User'}</span></div> )}
                        {(activeChat.type === 'group' || activeChat.type === 'channel') && ( <div className="flex gap-4 items-center cursor-pointer text-red-500 mt-2" onClick={() => handleChatAction('leave', activeChat.id)}><LogOut className="w-6 h-6" /><span>Leave {activeChat.type === 'group' ? 'Group' : 'Channel'}</span></div> )}
                        {activeChat.id !== 0 && (<div className="flex gap-4 items-center text-red-500 cursor-pointer" onClick={() => handleChatAction('delete', activeChat.id)}><Trash2 className="w-6 h-6" /><span>Delete Chat</span></div>)}
                    </div>
                    <div className="p-2">
                        <div className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-gray-500"><Grid size={16} /> Shared Media</div>
                        <div className="grid grid-cols-3 gap-1">
                            {activeChat.messages.filter(m => m.type === 'image' && m.fileUrl).map(m => ( <img key={m.id} src={m.fileUrl} className="w-full h-24 object-cover cursor-pointer hover:opacity-80" alt="Shared media" /> ))}
                            {activeChat.messages.filter(m => m.type === 'image').length === 0 && <div className="col-span-3 text-center text-xs text-gray-400 py-8 flex flex-col items-center"><ImageIcon size={24} className="mb-2 opacity-50"/><span>No shared media</span></div>}
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}