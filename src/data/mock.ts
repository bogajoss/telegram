// Types
export interface Reaction {
  emoji: string;
  count: number;
  me: boolean;
}

export interface GameState {
  board: (string | null)[];
  xIsNext: boolean;
  winner: string | null;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  voted: boolean;
}

export interface Message {
  id: string;
  text?: string;
  sender: "me" | "them";
  time: string;
  status: "sent" | "read";
  type?:
    | "text"
    | "image"
    | "sticker"
    | "gif"
    | "poll"
    | "game"
    | "voice"
    | "file";
  reactions: Reaction[];
  fileUrl?: string;
  replyTo?: Message;
  isEdited?: boolean;
  isForwarded?: boolean;
  selfDestructTime?: number;
  expiresAt?: number;
  senderName?: string;
  question?: string;
  options?: PollOption[];
  gameState?: GameState;
  views?: number;
  isScheduled?: boolean;
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  type: "private" | "group" | "channel" | "bot";
  role: "owner" | "admin" | "member" | "subscriber" | "bot";
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  archived: boolean;
  muted: boolean;
  blocked: boolean;
  pinnedMessageId: string | null;
  messages: Message[];
  bio?: string;
  mobile?: string;
  members?: number;
  subscribers?: string;
  verified?: boolean;
  description?: string;
  link?: string;
  lastSeen?: string;
}

export interface Story {
  id: number;
  user: string;
  avatar: string;
  image: string;
  viewed: boolean;
  time: string;
}

export interface Contact {
  id: number;
  name: string;
  avatar: string;
  bio: string;
}

export interface Folder {
  id: string;
  name: string;
  type: "all" | "private" | "group";
  locked: boolean;
}

export interface Profile {
  name: string;
  bio: string;
  phone: string;
  username: string;
}

export interface AccentColor {
  name: string;
  value: string;
}

// Constants
export const COMMON_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🔥",
  "🎉",
  "💩",
  "🥰",
  "🤔",
  "👋",
  "🙏",
  "👀",
  "✨",
];

export const ACCENT_COLORS: AccentColor[] = [
  { name: "Blue", value: "#3390ec" },
  { name: "Purple", value: "#8774e1" },
  { name: "Green", value: "#46c46e" },
  { name: "Orange", value: "#e58e39" },
  { name: "Pink", value: "#f267ad" },
  { name: "Red", value: "#e53935" },
];

export const STICKERS = [
  "https://cdn-icons-png.flaticon.com/128/9408/9408166.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408201.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408175.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408226.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408238.png",
  "https://cdn-icons-png.flaticon.com/128/9408/9408238.png",
];

export const GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZGI4Z3J5aG56Y3h6Z3I1Z3I1Z3I1Z3I1Z3I1Z3I1/3o7TKSjRrfIPjeiVyM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZGI4Z3J5aG56Y3h6Z3I1Z3I1Z3I1Z3I1Z3I1Z3I1/26AHONQ79FdWZhAI0/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZGI4Z3J5aG56Y3h6Z3I1Z3I1Z3I1Z3I1Z3I1Z3I1/l0HlHJGHe3yAMhdQY/giphy.gif",
];

export const MOCK_STORIES: Story[] = [
  {
    id: 1,
    user: "Momo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Momo",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    viewed: false,
    time: "2h ago",
  },
  {
    id: 2,
    user: "Coco",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco",
    image:
      "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    viewed: false,
    time: "4h ago",
  },
  {
    id: 3,
    user: "Bubu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bubu",
    image:
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    viewed: true,
    time: "6h ago",
  },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 101,
    name: "Alice Wonderland",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    bio: "Curiouser and curiouser!",
  },
  {
    id: 102,
    name: "Bob Builder",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    bio: "Can we fix it?",
  },
  {
    id: 103,
    name: "Charlie Chaplin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    bio: "Silence is golden.",
  },
];

export const INITIAL_CHATS: Chat[] = [
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
      {
        id: "msg-1",
        text: "Meeting notes: Buy milk",
        sender: "me",
        time: "10:00 AM",
        status: "read",
        type: "text",
        reactions: [],
      },
    ],
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
      {
        id: "msg-2",
        text: "I can help you create and manage Telegram bots. Try sending /newbot.",
        sender: "them",
        time: "Yesterday",
        status: "read",
        reactions: [],
      },
    ],
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
      {
        id: "msg-3",
        text: "Hey! Are we still meeting?",
        sender: "them",
        time: "10:30 AM",
        status: "read",
        reactions: [],
      },
      {
        id: "msg-4",
        text: "Yes! I'm on my way 🚗",
        sender: "me",
        time: "10:32 AM",
        status: "read",
        reactions: [{ emoji: "🔥", count: 1, me: true }],
      },
      {
        id: "msg-5",
        text: "It's a secret! ||Don't tell anyone||",
        sender: "them",
        time: "10:42 AM",
        status: "read",
        reactions: [{ emoji: "❤️", count: 2, me: false }],
      },
    ],
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
      {
        id: "msg-6",
        text: "Guys, please check the Figma file",
        sender: "them",
        senderName: "Alice",
        time: "10:55 AM",
        status: "read",
        reactions: [],
      },
      {
        id: "msg-7",
        type: "poll",
        sender: "me",
        senderName: "Me",
        time: "10:56 AM",
        status: "read",
        reactions: [],
        question: "When should we launch?",
        options: [
          { id: 1, text: "Monday", votes: 2, voted: false },
          { id: 2, text: "Wednesday", votes: 5, voted: true },
          { id: 3, text: "Friday", votes: 1, voted: false },
        ],
      },
    ],
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
      {
        id: "msg-8",
        text: "We just launched version 2.0! Enjoy.",
        sender: "me",
        time: "9:00 AM",
        status: "read",
        reactions: [{ emoji: "🔥", count: 152, me: true }],
        views: 4500,
      },
    ],
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
      {
        id: "msg-9",
        text: "Did you know you can organize chats into folders? Go to Settings > Folders.",
        sender: "them",
        time: "Yesterday",
        status: "read",
        reactions: [{ emoji: "👍", count: 1200, me: false }],
        views: 56000,
      },
    ],
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
    pinnedMessageId: null,
    messages: [
      {
        id: "msg-10",
        text: "Did you finish the design?",
        sender: "them",
        time: "9:00 AM",
        status: "read",
        reactions: [],
      },
      {
        id: "msg-11",
        text: "Almost done!",
        sender: "me",
        time: "9:10 AM",
        status: "read",
        reactions: [],
      },
    ],
  },
];

export const MOCK_REPLIES = [
  "Okay! 👍",
  "Haha really? 😂",
  "Sounds good.",
  "Send me a pic!",
  "Wait, what?",
  "Nice!",
  "I'll check it out.",
  "👀",
];
