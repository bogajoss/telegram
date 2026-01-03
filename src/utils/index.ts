import type { Message } from "@/data/mock";

export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const groupMessagesByDate = (
  messages: Message[],
): Record<string, Message[]> => {
  const groups: Record<string, Message[]> = {};
  messages.forEach((message) => {
    const d = new Date(message.time);
    const date = isNaN(d.getTime())
      ? message.time.split(" ")[0]
      : d.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
  });
  return groups;
};

export const checkPermission = (
  role: "owner" | "admin" | "member" | "subscriber" | "bot",
  action: string,
): boolean => {
  const policies: Record<
    "owner" | "admin" | "member" | "subscriber" | "bot",
    string[]
  > = {
    owner: ["delete", "pin", "edit", "post", "invite"],
    admin: ["delete", "pin", "post", "invite"],
    member: ["post", "invite"],
    subscriber: [],
    bot: ["post"],
  };
  return policies[role]?.includes(action) || false;
};

export const performSearch = <T extends Record<string, any>>(
  list: T[],
  query: string,
  keys: (keyof T)[],
): T[] => {
  if (!query) return list;
  const lowerQuery = query.toLowerCase();
  return list.filter((item) => {
    return keys.some((key) => {
      const val = item[key];
      if (typeof val === "string")
        return val.toLowerCase().includes(lowerQuery);
      return false;
    });
  });
};
