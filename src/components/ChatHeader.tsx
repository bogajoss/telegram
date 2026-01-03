import type React from "react";
import {
  ChevronLeft,
  Phone,
  Video,
  Search,
  Info,
  MoreVertical,
} from "lucide-react";
import type { Chat } from "@/data/mock";

interface ChatHeaderProps {
  activeChat: Chat;
  darkMode: boolean;
  isSearching: boolean;
  onBack: () => void;
  onSearch: () => void;
  onCall: (type: "audio" | "video") => void;
  onInfo: () => void;
  onMore?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  darkMode,
  isSearching,
  onBack,
  onSearch,
  onCall,
  onInfo,
  onMore,
}) => {
  const getStatusText = (): string => {
    if (activeChat.type === "channel") {
      return `${activeChat.members || 0} subscribers`;
    }
    if (activeChat.type === "group") {
      return `${activeChat.members || 0} members`;
    }
    return activeChat.online ? "Online" : "Offline";
  };

  const headerBg = darkMode ? "bg-[#212121]" : "bg-white";
  const headerBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div
      className={`border-b ${headerBorder} p-3 flex items-center justify-between ${headerBg}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onBack}
          className={`p-1 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
          title="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {activeChat.avatar ? (
            <img
              src={activeChat.avatar}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              alt={activeChat.name}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold flex-shrink-0">
              {activeChat.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base truncate">
              {activeChat.name}
            </h2>
            <p
              className={`text-xs ${textMuted} truncate`}
            >
              {getStatusText()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onCall("audio")}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
          }`}
          title="Audio call"
        >
          <Phone size={20} />
        </button>

        <button
          onClick={() => onCall("video")}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
          }`}
          title="Video call"
        >
          <Video size={20} />
        </button>

        <button
          onClick={onSearch}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            isSearching ? "bg-accent/20 text-accent" : darkMode ? "text-gray-400" : "text-gray-500"
          }`}
          title="Search"
        >
          <Search size={20} />
        </button>

        <button
          onClick={onInfo}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
          }`}
          title="Chat info"
        >
          <Info size={20} />
        </button>

        <button
          onClick={onMore}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
          }`}
          title="More options"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};
