import type React from "react";
import {
  Bookmark,
  Bot,
  Users,
  Megaphone,
  Ban,
  VolumeX,
  CheckCircle,
} from "lucide-react";
import type { Chat } from "@/data/mock";

interface ChatListProps {
  chats: Chat[];
  activeChatId: number | null;
  onChatSelect: (id: number) => void;
  onChatContextMenu?: (e: React.MouseEvent, chatId: number) => void;
  darkMode: boolean;
  formatPreviewMessage: (text: string | undefined, type?: string) => string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onChatContextMenu,
  darkMode,
  formatPreviewMessage,
}) => {
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const subTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const hoverClass = darkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-gray-100";
  const borderClass = darkMode ? "border-black" : "border-gray-200";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <p>No chats found</p>
        </div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            onContextMenu={(e) => onChatContextMenu?.(e, chat.id)}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition duration-200 select-none ${
              activeChatId === chat.id ? "bg-accent text-white" : hoverClass
            }`}
          >
            <div className="relative shrink-0">
              {chat.id === 0 ? (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-accent">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
              ) : chat.id === 99 ? (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              ) : chat.avatar === "group" ? (
                <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              ) : chat.avatar === "channel" ? (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
              ) : (
                <img
                  src={chat.avatar}
                  className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                  alt={chat.name}
                />
              )}
              {chat.online && (
                <div
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                    activeChatId === chat.id
                      ? "bg-white border-accent"
                      : "bg-green-500 border-white"
                  }`}
                ></div>
              )}
            </div>
            <div
              className={`flex-1 min-w-0 border-b pb-2 ml-1 h-full flex flex-col justify-center ${
                borderClass
              } ${activeChatId === chat.id ? "border-transparent" : ""}`}
            >
              <div className="flex justify-between items-baseline">
                <h3
                  className={`font-semibold text-[15px] truncate flex items-center gap-1 min-w-0 ${
                    activeChatId === chat.id ? "text-white" : textClass
                  }`}
                >
                  {chat.name}
                  {chat.blocked && <Ban className="w-3 h-3 text-red-500" />}
                  {chat.muted && <VolumeX className="w-3 h-3 opacity-50" />}
                  {chat.verified && (
                    <CheckCircle
                      size={12}
                      className="text-blue-500 fill-white"
                    />
                  )}
                </h3>
                <span
                  className={`text-xs ${
                    activeChatId === chat.id ? "text-white/80" : subTextClass
                  }`}
                >
                  {chat.time}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p
                  className={`text-[14px] truncate flex-1 min-w-0 ${
                    activeChatId === chat.id ? "text-white/80" : subTextClass
                  }`}
                >
                  {formatPreviewMessage(chat.lastMessage, chat.messages[0]?.type)}
                </p>
                {chat.unread > 0 && (
                  <div
                    className={`min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full flex items-center justify-center ml-2 ${
                      activeChatId === chat.id
                        ? "bg-white text-accent"
                        : "text-white"
                    }`}
                    style={
                      activeChatId !== chat.id
                        ? { backgroundColor: "#c4c9cc" }
                        : {}
                    }
                  >
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
