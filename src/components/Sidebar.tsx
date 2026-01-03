import type React from "react";
import {
  Menu,
  Search,
  Edit3,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { ChatList } from "@/components/ChatList";
import type { Chat } from "@/data/mock";

interface SidebarProps {
  chats: Chat[];
  activeChatId: number | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onChatSelect: (chatId: number) => void;
  onNewChat: () => void;
  onSettings: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onChatContextMenu?: (e: React.MouseEvent, chatId: number) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  searchQuery,
  setSearchQuery,
  onChatSelect,
  onNewChat,
  onSettings,
  onLogout,
  darkMode,
  onToggleDarkMode,
  onChatContextMenu,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const formatPreviewMessage = (text: string | undefined, type?: string): string => {
    if (type === "image") return "📷 Photo";
    if (type === "sticker") return "🎨 Sticker";
    if (type === "gif") return "🎬 GIF";
    if (type === "poll") return "📊 Poll";
    if (type === "game") return "🎮 Game";
    if (type === "voice") return "🎙️ Voice message";
    if (type === "file") return "📄 File";
    return text || "(no text)";
  };

  const sidebarBg = darkMode ? "bg-[#121212]" : "bg-gray-50";
  const sidebarBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-[#212121]" : "bg-white";

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`${
        isSidebarOpen ? "w-80" : "w-0"
      } transition-all duration-300 overflow-hidden border-r ${sidebarBorder} flex flex-col h-screen ${sidebarBg}`}
    >
      {/* Header */}
      <div
        className={`border-b ${sidebarBorder} p-3 flex items-center justify-between gap-2`}
      >
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <h1 className="font-bold text-lg flex-1">Chats</h1>

        <button
          onClick={onNewChat}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
          title="New chat"
        >
          <Edit3 size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-300/30">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full ${inputBg} border transition focus-within:ring-2 ring-accent ring-offset-0 ${
            darkMode ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <Search size={18} className={darkMode ? "text-gray-500" : "text-gray-400"} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className={`flex-1 bg-transparent outline-none text-sm ${
              darkMode ? "placeholder-gray-500" : "placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <ChatList
            chats={filteredChats}
            activeChatId={activeChatId}
            onChatSelect={onChatSelect}
            onChatContextMenu={onChatContextMenu}
            darkMode={darkMode}
            formatPreviewMessage={formatPreviewMessage}
          />
        ) : (
          <div
            className={`flex items-center justify-center h-full text-center p-4 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <p>No chats found</p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div
        className={`border-t ${sidebarBorder} p-2 flex items-center gap-2`}
      >
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-yellow-400" : "text-gray-500"
          }`}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={onSettings}
          className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <button
          onClick={onLogout}
          className={`p-2 rounded-lg transition hover:bg-red-500/10 ml-auto ${
            darkMode ? "text-red-400" : "text-red-500"
          }`}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};
