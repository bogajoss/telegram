import type React from "react";
import { createContext, useContext } from "react";
import type {
  Chat,
  Message,
  Folder,
  Profile,
} from "@/data/mock";

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  
  // Chat state
  chats: Chat[];
  setChats: (value: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;
  
  // Theme
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  
  // Profile
  myProfile: Profile;
  setMyProfile: (value: Profile) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (value: boolean) => void;
  tempProfile: Profile;
  setTempProfile: (value: Profile) => void;
  
  // Sidebar
  sidebarView: "main" | "archived" | "contacts" | "settings";
  setSidebarView: (view: "main" | "archived" | "contacts" | "settings") => void;
  activeFolder: string;
  setActiveFolder: (id: string) => void;
  folders: Folder[];
  setFolders: (value: Folder[] | ((prev: Folder[]) => Folder[])) => void;
  unlockedFolders: string[];
  setUnlockedFolders: (value: string[] | ((prev: string[]) => string[])) => void;
  
  // UI
  isProfileOpen: boolean;
  setIsProfileOpen: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
