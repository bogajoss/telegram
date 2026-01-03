"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type {
  Chat,
  Message,
  Contact,
  Story,
  Reaction,
  AccentColor,
} from "@/data/mock";
import {
  INITIAL_CHATS,
  MOCK_CONTACTS,
  MOCK_STORIES,
  ACCENT_COLORS,
} from "@/data/mock";
import { generateUUID, formatTime, groupMessagesByDate, checkPermission, performSearch } from "@/utils";
import {
  Menu,
  ChevronLeft,
  Phone,
  Video,
  Search,
  Info,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  X,
  Eye,
  EyeOff,
  Edit3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Flame,
  Forward,
  CheckCircle,
  Check,
  CheckCheck,
  GripVertical,
  Eraser,
  Pencil,
  Bot,
  Users,
  Megaphone,
  Ban,
  VolumeX,
  Bookmark,
} from "lucide-react";

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Chat State
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(0);
  const [inputValue, setInputValue] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Drawing State
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

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

  // Event Handlers
  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      setUsername("");
      setPassword("");
    }, 1000);
  }, []);

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
      time: formatTime(new Date()),
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
          time: formatTime(new Date()),
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
      <div className={`flex h-screen items-center justify-center ${darkMode ? "bg-[#0f0f0f]" : "bg-gray-50"}`}>
        <div className={`w-full max-w-md rounded-lg p-8 ${darkMode ? "bg-[#212121]" : "bg-white"} shadow-lg`}>
          <div className="mb-8 flex items-center justify-center gap-2">
            <Bot className="text-accent" size={32} />
            <h1 className="text-3xl font-bold">ChatGPT</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="group relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                className={`peer w-full border-b-2 bg-transparent px-0 py-2 outline-none transition ${
                  darkMode ? "border-gray-600 text-white" : "border-gray-300 text-black"
                } focus:border-accent`}
              />
              <label className={`pointer-events-none absolute left-0 top-2 transition duration-200 ${
                username ? "-translate-y-6 text-sm text-accent" : "text-gray-500"
              } peer-focus:-translate-y-6 peer-focus:text-sm peer-focus:text-accent`}>
                Username
              </label>
            </div>

            <div className="group relative">
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className={`peer w-full border-b-2 bg-transparent px-0 py-2 outline-none transition ${
                    darkMode ? "border-gray-600 text-white" : "border-gray-300 text-black"
                  } focus:border-accent`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`ml-2 p-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <label className={`pointer-events-none absolute left-0 top-2 transition duration-200 ${
                password ? "-translate-y-6 text-sm text-accent" : "text-gray-500"
              } peer-focus:-translate-y-6 peer-focus:text-sm peer-focus:text-accent`}>
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-accent py-2 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? "bg-[#0f0f0f]" : "bg-white"}`}>
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r ${darkMode ? "border-gray-700" : "border-gray-200"} flex flex-col h-screen ${darkMode ? "bg-[#121212]" : "bg-gray-50"}`}
      >
        {/* Header */}
        <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"} p-3 flex items-center justify-between gap-2`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition hover:bg-black/10 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg flex-1">Chats</h1>
          <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            <Edit3 size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-gray-300/30">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${darkMode ? "bg-[#212121]" : "bg-white"} border transition focus-within:ring-2 ring-accent ring-offset-0 ${
            darkMode ? "border-gray-600" : "border-gray-200"
          }`}>
            <Search size={18} className={darkMode ? "text-gray-500" : "text-gray-400"} />
            <input
              type="text"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className={`flex-1 bg-transparent outline-none text-sm ${
                darkMode ? "placeholder-gray-500" : "placeholder-gray-400"
              }`}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats
            .filter((chat) =>
              chat.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
            )
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`px-3 py-3 border-b cursor-pointer transition ${
                  activeChatId === chat.id
                    ? `bg-accent/20 ${darkMode ? "border-gray-600" : "border-gray-200"}`
                    : `${darkMode ? "border-gray-700 hover:bg-[#1a1a1a]" : "border-gray-200 hover:bg-gray-100"}`
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      alt={chat.name}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold flex-shrink-0 relative">
                      {chat.name.charAt(0).toUpperCase()}
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2 min-w-0">
                      <h3 className="font-bold truncate">{chat.name}</h3>
                      <span className={`text-xs flex-shrink-0 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {chat.time}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} p-2 flex items-center gap-2`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition hover:bg-black/10 ${
              darkMode ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            <Settings size={20} />
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setUsername("");
              setPassword("");
            }}
            className={`p-2 rounded-lg transition hover:bg-red-500/10 ml-auto ${
              darkMode ? "text-red-400" : "text-red-500"
            }`}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"} p-3 flex items-center justify-between ${darkMode ? "bg-[#212121]" : "bg-white"}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setActiveChatId(null)}
                className={`p-1 rounded-lg transition hover:bg-black/10 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
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
                  <h2 className="font-bold text-base truncate">{activeChat.name}</h2>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} truncate`}>
                    {activeChat.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <Phone size={20} />
              </button>
              <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <Video size={20} />
              </button>
              <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <Search size={20} />
              </button>
              <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <Info size={20} />
              </button>
              <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 relative bg-[#99ba92]">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none telegram-bg"
              style={{
                backgroundColor: darkMode ? "#0f0f0f" : "#7a8c76",
              }}
            ></div>
            <div className="relative z-0 max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-2">
              {Object.entries(groupMessagesByDate(activeChat.messages)).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex justify-center my-2 sticky top-2 z-10">
                    <span className="bg-black/20 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {date}
                    </span>
                  </div>
                  {msgs
                    .filter(
                      (m) =>
                        !chatSearchQuery ||
                        (typeof m.text === "string" &&
                          m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                    )
                    .map((msg) => {
                      const isMe = msg.sender === "me";
                      return (
                        <div
                          key={msg.id}
                          className={`flex w-full ${
                            isMe ? "justify-end" : "justify-start"
                          } mb-1 group animate-message`}
                        >
                          <div
                            className={`relative max-w-[85%] px-3 py-1.5 shadow-sm text-[15px] rounded-lg ${
                              isMe
                                ? `text-white rounded-tr-none bg-accent`
                                : `${darkMode ? "bg-[#212121] text-white" : "bg-white text-black"} rounded-tl-none`
                            }`}
                            style={
                              isMe && darkMode
                                ? { backgroundColor: "#766ac8" }
                                : {}
                            }
                          >
                            {msg.type === "image" && msg.fileUrl ? (
                              <img
                                src={msg.fileUrl}
                                className="rounded-lg mb-1 max-w-full max-h-64 object-cover"
                                alt="Shared image"
                              />
                            ) : msg.type === "poll" ? (
                              <div className="min-w-[200px] sm:min-w-[250px]">
                                <div className="font-bold mb-2">{msg.question}</div>
                                <div className="flex flex-col gap-2">
                                  {msg.options?.map((opt) => (
                                    <button
                                      key={opt.id}
                                      onClick={() => handleVote(msg.id, opt.id)}
                                      className={`relative overflow-hidden w-full text-left px-3 py-2 rounded border transition ${
                                        opt.voted
                                          ? "border-accent"
                                          : "border-transparent bg-black/5 hover:bg-black/10"
                                      }`}
                                    >
                                      {opt.voted && (
                                        <div
                                          className="absolute inset-0 opacity-20 bg-accent"
                                          style={{
                                            width: `${
                                              (opt.votes /
                                                Math.max(
                                                  1,
                                                  msg.options?.reduce(
                                                    (a, b) => a + b.votes,
                                                    0
                                                  ) || 0
                                                )) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      )}
                                      <div className="relative flex justify-between z-10">
                                        <span>{opt.text}</span>
                                        {opt.voted && (
                                          <CheckCircle size={16} className="text-accent" />
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : msg.type === "game" ? (
                              <div className="min-w-[200px] flex flex-col items-center p-2 bg-black/5 rounded">
                                <div className="font-bold mb-2 flex items-center gap-2">
                                  🎮 Tic Tac Toe
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  {msg.gameState?.board.map((cell, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleGameMove(msg.id, i)}
                                      disabled={
                                        !!cell || !!msg.gameState?.winner
                                      }
                                      className="w-12 h-12 bg-white rounded flex items-center justify-center text-xl font-bold border border-gray-200 text-black"
                                    >
                                      {cell}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="mr-8 pb-1 inline-block break-words">{getMessageText(msg)}</div>
                            )}

                            <div className="float-right flex items-center gap-1 ml-2 mt-2 select-none h-3 relative top-0.5">
                              <span
                                className={`text-[11px] ${
                                  isMe ? "text-green-800/60" : "text-gray-400"
                                } ${darkMode && isMe ? "text-gray-300" : ""}`}
                              >
                                {msg.time.split(" ")[0]}
                              </span>
                              {isMe &&
                                (activeChat.id === 0 ? (
                                  <CheckCheck
                                    className={`w-3.5 h-3.5 ${
                                      darkMode
                                        ? "text-blue-300"
                                        : "text-[#53bdeb]"
                                    }`}
                                  />
                                ) : msg.status === "read" ? (
                                  <CheckCheck
                                    className={`w-3.5 h-3.5 ${
                                      darkMode
                                        ? "text-blue-300"
                                        : "text-[#53bdeb]"
                                    }`}
                                  />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-gray-400" />
                                ))}
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

          {/* Input */}
          <div
            className={`border-t ${darkMode ? "border-gray-600" : "border-gray-200"} p-2 flex gap-2 items-flex-end bg-opacity-95 ${
              darkMode ? "bg-[#121212]" : "bg-gray-50"
            }`}
          >
            <button className={`p-2 rounded-lg transition hover:bg-black/10 ${
              darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
            }`}>
              <MoreVertical size={20} />
            </button>

            <label className="p-2 cursor-pointer rounded-lg transition hover:bg-black/10">
              <Paperclip
                size={20}
                className={darkMode ? "text-gray-400" : "text-gray-500"}
              />
              <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
            </label>

            <div
              className={`flex-1 flex gap-1 items-center border rounded-lg px-3 py-2 ${
                darkMode ? "border-gray-600" : "border-gray-200"
              } ${darkMode ? "bg-[#212121] text-white" : "bg-white text-black"} focus-within:ring-2 ring-accent ring-offset-0`}
            >
              {hasDrawing && (
                <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded text-xs font-medium text-accent">
                  <GripVertical size={14} /> Drawing Ready
                  <button
                    onClick={() => {
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
                    className="ml-1 hover:bg-black/20 p-0.5 rounded"
                  >
                    <Eraser size={12} />
                  </button>
                </div>
              )}
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) {
                      handleSendMessage();
                    }
                  }
                }}
                placeholder="Type a message..."
                className={`flex-1 bg-transparent outline-none resize-none max-h-20 ${
                  darkMode ? "placeholder-gray-500" : "placeholder-gray-400"
                }`}
                rows={1}
              />
            </div>

            <button
              onClick={() => setShowDrawing(true)}
              className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
              }`}
            >
              ✏️
            </button>

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-lg transition hover:bg-black/10 ${
                darkMode ? "text-gray-400 hover:text-white" : "text-gray-500"
              }`}
            >
              <Smile size={20} />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && !hasDrawing}
              className="p-2 rounded-lg transition bg-accent text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasDrawing ? <Paperclip size={20} /> : <Send size={20} />}
            </button>

            <button className="p-2 rounded-lg transition hover:bg-black/10 text-accent">
              <Mic size={20} />
            </button>
          </div>

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
