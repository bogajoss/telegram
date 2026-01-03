import type React from "react";
import {
  CheckCheck,
  Check,
  Eye,
  Flame,
  Forward,
  CheckCircle,
} from "lucide-react";
import type { Chat, Message } from "@/data/mock";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { groupMessagesByDate, formatTime } from "@/utils";

interface MessageListProps {
  activeChat: Chat;
  darkMode: boolean;
  onMessageContextMenu?: (e: React.MouseEvent, messageId: string) => void;
  onVote?: (messageId: string, optionId: number) => void;
  onGameMove?: (messageId: string, index: number) => void;
  getMessageText: (msg: Message) => string;
  chatSearchQuery: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
  activeChat,
  darkMode,
  onMessageContextMenu,
  onVote,
  onGameMove,
  getMessageText,
  chatSearchQuery,
  messagesEndRef,
}) => {
  const subTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const theirBubble = darkMode ? "bg-[#212121] text-white" : "bg-white text-black";
  const myBubble = "text-white";

  const groupedMessages = groupMessagesByDate(activeChat.messages);

  return (
    <div className="flex-1 overflow-y-auto p-2 relative bg-[#99ba92]">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none telegram-bg"
        style={{
          backgroundColor: darkMode ? "#0f0f0f" : "#7a8c76",
        }}
      ></div>
      <div className="relative z-0 max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-2">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
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
                    onContextMenu={(e) => onMessageContextMenu?.(e, msg.id)}
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    } mb-1 group animate-message`}
                  >
                    <div
                      className={`relative max-w-[85%] px-3 py-1.5 shadow-sm text-[15px] rounded-lg ${
                        isMe
                          ? `${myBubble} rounded-tr-none bg-accent`
                          : `${theirBubble} rounded-tl-none`
                      }`}
                      style={
                        isMe && darkMode
                          ? { backgroundColor: "#766ac8" }
                          : {}
                      }
                    >
                      {!isMe && activeChat.type === "group" && (
                        <div className="text-xs text-[#e17076] font-semibold mb-0.5">
                          {msg.senderName || activeChat.name}
                        </div>
                      )}
                      {msg.isForwarded && (
                        <div className="text-xs font-medium mb-1 flex items-center gap-1 text-accent">
                          <Forward size={12} /> Forwarded message
                        </div>
                      )}
                      {msg.replyTo && (
                        <div
                          className={`mb-1 pl-2 border-l-2 text-xs opacity-80 cursor-pointer border-accent`}
                          style={
                            isMe ? { borderColor: "rgba(255,255,255,0.6)" } : {}
                          }
                        >
                          <div
                            className={`font-semibold`}
                            style={{
                              color: isMe ? "white" : "#3390ec",
                            }}
                          >
                            {msg.replyTo.sender === "me"
                              ? "You"
                              : activeChat.name}
                          </div>
                          <div className="truncate">{msg.replyTo.text}</div>
                        </div>
                      )}

                      {msg.selfDestructTime && msg.selfDestructTime > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-500 mb-1 font-bold">
                          <Flame size={12} className="animate-pulse" />
                          Self-destructing
                        </div>
                      )}

                      {msg.type === "image" && msg.fileUrl ? (
                        <img
                          src={msg.fileUrl}
                          className="rounded-lg mb-1 max-w-full max-h-64 object-cover"
                          alt="Shared image"
                        />
                      ) : msg.type === "sticker" ? (
                        <img
                          src={msg.fileUrl}
                          className="w-32 h-32 mb-1"
                          alt="Sticker"
                        />
                      ) : msg.type === "gif" ? (
                        <img
                          src={msg.fileUrl}
                          className="rounded-lg mb-1 max-w-full max-h-48 object-cover"
                          alt="GIF"
                        />
                      ) : msg.type === "poll" ? (
                        <div className="min-w-[200px] sm:min-w-[250px]">
                          <div className="font-bold mb-2">{msg.question}</div>
                          <div className="flex flex-col gap-2">
                            {msg.options?.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => onVote?.(msg.id, opt.id)}
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
                                <div className="relative z-10 text-xs opacity-70 mt-1">
                                  {Math.round(
                                    (opt.votes /
                                      Math.max(
                                        1,
                                        msg.options?.reduce(
                                          (a, b) => a + b.votes,
                                          0
                                        ) || 0
                                      )) *
                                      100
                                  )}
                                  % ({opt.votes})
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="text-xs opacity-60 mt-2">
                            {msg.options?.reduce((a, b) => a + b.votes, 0) ||
                              0}{" "}
                            votes
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
                                onClick={() => onGameMove?.(msg.id, i)}
                                disabled={
                                  !!cell || !!msg.gameState?.winner
                                }
                                className="w-12 h-12 bg-white rounded flex items-center justify-center text-xl font-bold border border-gray-200 text-black"
                              >
                                {cell}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 text-xs font-bold">
                            {msg.gameState?.winner
                              ? `Winner: ${msg.gameState.winner}!`
                              : `Next: ${
                                  msg.gameState?.xIsNext ? "X" : "O"
                                }`}
                          </div>
                        </div>
                      ) : (
                        <div className="mr-8 pb-1 inline-block break-words selection-accent">
                          <RichTextRenderer text={getMessageText(msg)} />
                        </div>
                      )}

                      <div className="float-right flex items-center gap-1 ml-2 mt-2 select-none h-3 relative top-0.5">
                        {msg.isEdited && (
                          <span className={`text-[10px] ${subTextClass}`}>
                            edited
                          </span>
                        )}
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
                          ) : activeChat.type === "channel" ? null : msg.status ===
                            "read" ? (
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
                        {activeChat.type === "channel" &&
                          msg.views &&
                          msg.views > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-400 ml-1">
                              <Eye size={10} />{" "}
                              {msg.views > 1000
                                ? (msg.views / 1000).toFixed(1) + "k"
                                : msg.views}
                            </span>
                          )}
                      </div>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div
                          className={`absolute -bottom-5 ${
                            isMe ? "right-0" : "left-0"
                          } flex gap-1 z-10`}
                        >
                          {msg.reactions.map((r, i) => (
                            <button
                              key={i}
                              className="bg-white border px-1.5 rounded-full text-xs shadow-sm text-black"
                            >
                              {r.emoji} {r.count > 1 && r.count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
