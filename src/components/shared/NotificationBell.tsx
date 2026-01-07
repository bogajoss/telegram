import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useGetUserById,
} from "@/lib/react-query/queries";
import { Bell, Check, Trash2, Heart, MessageCircle, Users } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

interface Notification {
  $id: string;
  recipient: string;
  type: "like" | "comment" | "follow";
  actor: string;
  postId?: string;
  message: string;
  read: boolean;
  $createdAt: string;
}

const NotificationItem = ({
  notification,
  onClose,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const { data: actor } = useGetUserById(notification.actor);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-0.5 border border-dark-2">
            <Heart className="h-2 w-2 text-white fill-white" />
          </div>
        );
      case "comment":
        return (
          <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-dark-2">
            <MessageCircle className="h-2 w-2 text-white fill-white" />
          </div>
        );
      case "follow":
        return (
          <div className="absolute -bottom-0.5 -right-0.5 bg-purple-500 rounded-full p-0.5 border border-dark-2">
            <Users className="h-2 w-2 text-white fill-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } catch {
      return "";
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.$id);
    }
    onClose();
    if (notification.postId) {
      navigate(`/posts/${notification.postId}`);
    } else {
      navigate(`/profile/${notification.actor}`);
    }
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-3 p-3 hover:bg-dark-3 transition-colors cursor-pointer group relative",
        !notification.read && "bg-dark-3/30"
      )}
      onClick={handleClick}>
      <div className="relative flex-shrink-0">
        <img
          src={actor?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="actor"
          className="h-10 w-10 rounded-full object-cover border border-dark-4"
        />
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-light-1 text-xs sm:text-sm line-clamp-2">
          <span className="font-bold">{actor?.name || "Someone"}</span>{" "}
          <span className="text-light-2">{notification.message}</span>
        </p>
        <p className="text-light-3 text-[10px] mt-0.5">
          {formatTime(notification.$createdAt)}
        </p>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.$id);
            }}
            className="h-6 w-6 p-1 hover:bg-dark-4 text-primary-500">
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.$id);
          }}
          className="h-6 w-6 p-1 hover:bg-dark-4 text-red-500">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {!notification.read && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:hidden" />
      )}
    </div>
  );
};

export const NotificationBell = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useGetNotifications(user.id);
  const { data: unreadCount } = useGetUnreadCount(user.id);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    markAllAsRead(user.id);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-dark-3 transition-colors"
        aria-label="Notifications">
        <Bell className="h-6 w-6 text-light-1" />

        {/* Unread Badge */}
        {unreadCount && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-dark-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[550px] bg-dark-2 border border-dark-4 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-4 bg-dark-2/50 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-light-1 font-bold text-base">
                Notifications
              </h2>
              {unreadCount && unreadCount > 0 ? (
                <p className="text-primary-500 text-[10px] font-medium">
                  You have {unreadCount} unread messages
                </p>
              ) : null}
            </div>
            {unreadCount && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-light-3 text-xs hover:text-white transition-colors flex items-center gap-1 bg-dark-3 px-2 py-1 h-auto">
                <Check className="h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
            {notifications &&
            notifications.documents &&
            notifications.documents.length > 0 ? (
              (notifications.documents as unknown as Notification[]).map(
                (notification) => (
                  <NotificationItem
                    key={notification.$id}
                    notification={notification}
                    onClose={() => setIsOpen(false)}
                    onMarkAsRead={(id) => markAsRead(id)}
                    onDelete={(id) => deleteNotif(id)}
                  />
                )
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="p-4 bg-dark-3 rounded-full mb-3">
                  <Bell className="h-8 w-8 text-light-4" />
                </div>
                <p className="text-light-2 font-semibold text-sm">No notifications</p>
                <p className="text-light-4 text-xs mt-1">We'll let you know when something happens!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-dark-4 bg-dark-3/30">
            <Button
              variant="secondary"
              onClick={handleViewAll}
              className="w-full bg-dark-4 hover:bg-dark-3 text-light-1 text-sm font-semibold transition-colors border-none">
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;