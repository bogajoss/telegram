import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import {
  COMMON_EMOJIS,
  STICKERS,
  GIFS,
} from "@/data/mock";

interface EmojiPickerProps {
  darkMode: boolean;
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  darkMode,
  onEmojiSelect,
  onClose,
  position,
}) => {
  const [activeTab, setActiveTab] = useState<
    "emoji" | "sticker" | "gif"
  >("emoji");

  const pickerBg = darkMode ? "bg-[#212121]" : "bg-white";
  const pickerBorder = darkMode ? "border-gray-600" : "border-gray-200";
  const tabActiveBg = darkMode
    ? "bg-accent text-white"
    : "bg-accent text-white";
  const tabInactiveBg = darkMode ? "bg-[#1a1a1a]" : "bg-gray-100";

  return (
    <div
      className={`fixed z-50 rounded-lg shadow-2xl border ${pickerBorder} overflow-hidden ${pickerBg}`}
      style={{
        top: position?.top ?? "50%",
        left: position?.left ?? "50%",
        transform: `translate(${position?.left ? "0" : "-50%"}, ${position?.top ? "0" : "-50%"})`,
        width: "320px",
        maxHeight: "400px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300/30">
        <h3 className="font-bold text-sm">Pick emoji</h3>
        <button
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300/30">
        {["emoji", "sticker", "gif"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition ${
              activeTab === tab ? tabActiveBg : tabInactiveBg
            }`}
          >
            {tab === "emoji" && "😀"}
            {tab === "sticker" && "🎨"}
            {tab === "gif" && "🎬"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-64 p-2">
        {activeTab === "emoji" && (
          <div className="grid grid-cols-6 gap-2">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onEmojiSelect(emoji);
                  onClose();
                }}
                className="text-2xl p-2 rounded hover:bg-black/10 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === "sticker" && (
          <div className="grid grid-cols-3 gap-2">
            {STICKERS.map((sticker, i) => (
              <button
                key={i}
                onClick={() => {
                  onEmojiSelect(sticker);
                  onClose();
                }}
                className="text-4xl p-2 rounded hover:bg-black/10 transition"
              >
                {sticker}
              </button>
            ))}
          </div>
        )}

        {activeTab === "gif" && (
          <div className="grid grid-cols-2 gap-2">
            {GIFS.slice(0, 6).map((gif, i) => (
              <button
                key={i}
                onClick={() => {
                  onEmojiSelect(gif);
                  onClose();
                }}
                className="text-center py-3 rounded hover:bg-black/10 transition text-xs"
              >
                {gif}
                <div className="text-sm mt-1">GIF</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
