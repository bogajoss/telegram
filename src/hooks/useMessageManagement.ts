import { useCallback, useState } from "react";
import type { Chat, Message } from "@/data/mock";

interface UseMessageManagementProps {
  onUpdateChats: (updateFn: (prev: Chat[]) => Chat[]) => void;
}

export const useMessageManagement = ({
  onUpdateChats,
}: UseMessageManagementProps) => {
  const updateChatWithNewMessage = useCallback(
    (chatId: number, message: Message) => {
      onUpdateChats((prev) => {
        const idx = prev.findIndex((c) => c.id === chatId);
        if (idx === -1) return prev;
        const updated: Chat = {
          ...prev[idx],
          messages: [...prev[idx].messages, message],
          lastMessage:
            message.type === "image"
              ? "🖼️ Photo"
              : message.type === "sticker"
                ? "Sticker"
                : message.type === "gif"
                  ? "GIF"
                  : message.type === "poll"
                    ? "📊 Poll"
                    : message.type === "game"
                      ? "🎮 Game"
                      : message.text || "",
          time: message.time,
          archived: false,
        };
        const newChats = [...prev];
        newChats.splice(idx, 1);
        newChats.unshift(updated);
        return newChats;
      });
    },
    [onUpdateChats],
  );

  return { updateChatWithNewMessage };
};

interface MessageContextState {
  visible: boolean;
  x: number;
  y: number;
  messageId: string | null;
}

export const useMessageContext = () => {
  const [msgContextMenu, setMsgContextMenu] = useState<MessageContextState>({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });

  const showContextMenu = useCallback(
    (e: React.MouseEvent, messageId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setMsgContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        messageId,
      });
    },
    [],
  );

  const hideContextMenu = useCallback(() => {
    setMsgContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    msgContextMenu,
    setMsgContextMenu,
    showContextMenu,
    hideContextMenu,
  };
};

interface ChatContextState {
  visible: boolean;
  x: number;
  y: number;
  chatId: number | null;
}

export const useChatContext = () => {
  const [chatListContextMenu, setChatListContextMenu] =
    useState<ChatContextState>({
      visible: false,
      x: 0,
      y: 0,
      chatId: null,
    });

  const showContextMenu = useCallback((e: React.MouseEvent, chatId: number) => {
    e.preventDefault();
    setChatListContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      chatId,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setChatListContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    chatListContextMenu,
    setChatListContextMenu,
    showContextMenu,
    hideContextMenu,
  };
};
