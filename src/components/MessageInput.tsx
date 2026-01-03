import type React from "react";
import {
  Send,
  GripVertical,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Eraser,
} from "lucide-react";

interface MessageInputProps {
  darkMode: boolean;
  hasDrawing: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrawingStart: () => void;
  onClearDrawing: () => void;
  onEmojiClick: () => void;
  onMore?: () => void;
  disableSend?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  darkMode,
  hasDrawing,
  inputValue,
  setInputValue,
  onSend,
  onFileUpload,
  onDrawingStart,
  onClearDrawing,
  onEmojiClick,
  onMore,
  disableSend,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend();
      }
    }
  };

  const inputBg = darkMode ? "bg-[#212121] text-white" : "bg-white text-black";
  const inputBorder = darkMode ? "border-gray-600" : "border-gray-200";

  return (
    <div
      className={`border-t ${inputBorder} p-2 flex gap-2 items-flex-end bg-opacity-95 ${
        darkMode ? "bg-[#121212]" : "bg-gray-50"
      }`}
    >
      <button
        onClick={onMore}
        className={`p-2 rounded-lg transition hover:bg-black/10 ${
          darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
        }`}
        title="More options"
      >
        <MoreVertical size={20} />
      </button>

      <label className="p-2 cursor-pointer rounded-lg transition hover:bg-black/10">
        <Paperclip
          size={20}
          className={darkMode ? "text-gray-400" : "text-gray-500"}
        />
        <input
          type="file"
          hidden
          onChange={onFileUpload}
          accept="image/*"
        />
      </label>

      <div
        className={`flex-1 flex gap-1 items-center border rounded-lg px-3 py-2 ${
          inputBorder
        } ${inputBg} focus-within:ring-2 ring-accent ring-offset-0`}
      >
        {hasDrawing && (
          <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded text-xs font-medium text-accent">
            <GripVertical size={14} /> Drawing Ready
            <button
              onClick={onClearDrawing}
              className="ml-1 hover:bg-black/20 p-0.5 rounded"
              title="Clear drawing"
            >
              <Eraser size={12} />
            </button>
          </div>
        )}
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className={`flex-1 bg-transparent outline-none resize-none max-h-20 ${
            darkMode ? "placeholder-gray-500" : "placeholder-gray-400"
          }`}
          rows={1}
        />
      </div>

      <button
        onClick={onDrawingStart}
        className={`p-2 rounded-lg transition hover:bg-black/10 ${
          darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
        }`}
        title="Draw"
      >
        ✏️
      </button>

      <button
        onClick={onEmojiClick}
        className={`p-2 rounded-lg transition hover:bg-black/10 ${
          darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
        }`}
        title="Emoji"
      >
        <Smile size={20} />
      </button>

      <button
        onClick={onSend}
        disabled={disableSend || (!inputValue.trim() && !hasDrawing)}
        className="p-2 rounded-lg transition bg-accent text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send"
      >
        {hasDrawing ? <Paperclip size={20} /> : <Send size={20} />}
      </button>

      <button className="p-2 rounded-lg transition hover:bg-black/10 text-accent">
        <Mic size={20} />
      </button>
    </div>
  );
};
