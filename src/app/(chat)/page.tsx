"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Chat, Message, Contact } from "@/data/mock";
import {
  INITIAL_CHATS,
  MOCK_CONTACTS,
  ACCENT_COLORS,
  type AccentColor,
} from "@/data/mock";
import { generateUUID, performSearch } from "@/utils";
import { Sidebar } from "@/components/Sidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { EmojiPicker } from "@/components/EmojiPicker";
import { AuthScreen } from "@/components/AuthScreen";
import { Pencil, X } from "lucide-react";

export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(0);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [hasDrawing, setHasDrawing] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Drawing setup
  useEffect(() => {
    if (showDrawing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#212121";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setDrawingCanvas(canvas);
    }
  }, [showDrawing]);

  // Drawing event handlers
  useEffect(() => {
    if (!drawingCanvas) return;

    let isDrawing = false;
    const ctx = drawingCanvas.getContext("2d");
    if (!ctx) return;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      const rect = drawingCanvas.getBoundingClientRect();
      const clientX =
        e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
      const clientY =
        e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const rect = drawingCanvas.getBoundingClientRect();
      const clientX =
        e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
      const clientY =
        e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
      setHasDrawing(true);
    };

    drawingCanvas.addEventListener("mousedown", startDrawing);
    drawingCanvas.addEventListener("mousemove", draw);
    drawingCanvas.addEventListener("mouseup", stopDrawing);
    drawingCanvas.addEventListener("touchstart", startDrawing);
    drawingCanvas.addEventListener("touchmove", draw);
    drawingCanvas.addEventListener("touchend", stopDrawing);

    return () => {
      drawingCanvas.removeEventListener("mousedown", startDrawing);
      drawingCanvas.removeEventListener("mousemove", draw);
      drawingCanvas.removeEventListener("mouseup", stopDrawing);
      drawingCanvas.removeEventListener("touchstart", startDrawing);
      drawingCanvas.removeEventListener("touchmove", draw);
      drawingCanvas.removeEventListener("touchend", stopDrawing);
    };
  }, [drawingCanvas]);

  const handleSendMessage = useCallback(() => {
    if (!activeChat || (!inputValue.trim() && !hasDrawing)) return;

    let fileUrl: string | undefined;
    if (hasDrawing && drawingCanvas) {
      fileUrl = drawingCanvas.toDataURL("image/png");
      setHasDrawing(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#212121";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }

    const newMessage: Message = {
      id: generateUUID(),
      text: inputValue,
      sender: "me",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      fileUrl,
      type: fileUrl ? "image" : undefined,
      reactions: [],
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    setInputValue("");
  }, [activeChat, inputValue, hasDrawing, drawingCanvas, activeChatId]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        const newMessage: Message = {
          id: generateUUID(),
          text: "",
          sender: "me",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sent",
          fileUrl,
          type: "image",
          reactions: [],
        };

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat
          )
        );
      };
      reader.readAsDataURL(file);
    },
    [activeChatId]
  );

  const getMessageText = (msg: Message): string => {
    if (typeof msg.text === "string") return msg.text;
    if (typeof msg.question === "string") return msg.question;
    return "";
  };

  const handleVote = useCallback(
    (messageId: string, optionId: number) => {
      if (!activeChat) return;
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId && msg.options
                    ? {
                        ...msg,
                        options: msg.options.map((opt) =>
                          opt.id === optionId
                            ? {
                                ...opt,
                                voted: !opt.voted,
                                votes: opt.voted ? opt.votes - 1 : opt.votes + 1,
                              }
                            : opt
                        ),
                      }
                    : msg
                ),
              }
            : chat
        )
      );
    },
    [activeChat, activeChatId]
  );

  const handleGameMove = useCallback(
    (messageId: string, index: number) => {
      if (!activeChat) return;
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId && msg.gameState
                    ? {
                        ...msg,
                        gameState: {
                          ...msg.gameState,
                          board: msg.gameState.board.map((cell, i) => {
                            const gs = msg.gameState;
                            return i === index && !cell && !gs?.winner
                              ? gs?.xIsNext
                                ? "X"
                                : "O"
                              : cell;
                          }),
                          xIsNext: !msg.gameState.xIsNext,
                        },
                      }
                    : msg
                ),
              }
            : chat
        )
      );
    },
    [activeChat, activeChatId]
  );

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={() => setIsAuthenticated(true)}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? "bg-[#0f0f0f]" : "bg-white"}`}>
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        searchQuery={chatSearchQuery}
        setSearchQuery={setChatSearchQuery}
        onChatSelect={setActiveChatId}
        onNewChat={() => {}}
        onSettings={() => {}}
        onLogout={() => setIsAuthenticated(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <ChatHeader
            activeChat={activeChat}
            darkMode={darkMode}
            isSearching={false}
            onBack={() => setActiveChatId(null)}
            onSearch={() => {}}
            onCall={() => {}}
            onInfo={() => {}}
          />

          {/* Messages */}
          <MessageList
            activeChat={activeChat}
            darkMode={darkMode}
            onMessageContextMenu={() => {}}
            onVote={handleVote}
            onGameMove={handleGameMove}
            getMessageText={getMessageText}
            chatSearchQuery={chatSearchQuery}
            messagesEndRef={messagesEndRef}
          />

          {/* Input */}
          <MessageInput
            darkMode={darkMode}
            hasDrawing={hasDrawing}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSendMessage}
            onFileUpload={handleFileUpload}
            onDrawingStart={() => setShowDrawing(true)}
            onClearDrawing={() => {
              setHasDrawing(false);
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) {
                  ctx.fillStyle = "#212121";
                  ctx.fillRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                  );
                }
              }
            }}
            onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <EmojiPicker
              darkMode={darkMode}
              onEmojiSelect={(emoji) => {
                setInputValue(inputValue + emoji);
              }}
              onClose={() => setShowEmojiPicker(false)}
              position={{ top: 100, left: 100 }}
            />
          )}

          {/* Drawing Modal */}
          {showDrawing && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="bg-[#212121] rounded-lg p-4 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Pencil size={20} /> Draw something
                  </h2>
                  <button
                    onClick={() => setShowDrawing(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full border border-gray-600 rounded cursor-crosshair"
                />

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowDrawing(false)}
                    className="flex-1 px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDrawing(false);
                      handleSendMessage();
                    }}
                    className="flex-1 px-4 py-2 rounded bg-accent hover:opacity-90 text-white transition"
                  >
                    Send Drawing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex-1 flex items-center justify-center ${
            darkMode ? "bg-[#0f0f0f]" : "bg-white"
          } text-center`}
        >
          <div className={darkMode ? "text-gray-500" : "text-gray-400"}>
            <div className="text-4xl mb-2">💬</div>
            <p>Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
