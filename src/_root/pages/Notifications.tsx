import { useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
  useGetUserById,
} from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Trash2,
  Heart,
  MessageCircle,
  Users,
  Bell,
  Square,
  CheckSquare,
} from "lucide-react";
import clsx from "clsx";

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

const CustomCheckbox = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: () => void 
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={clsx(
      "flex-shrink-0 transition-all duration-200 rounded-md",
      checked ? "text-primary-500 scale-110" : "text-dark-4 hover:text-light-4"
    )}>
    {checked ? (
      <CheckSquare className="h-6 w-6 fill-primary-500/10" />
    ) : (
      <Square className="h-6 w-6" />
    )}
  </button>
);

const NotificationItem = ({
  notification,
  isSelected,
  onToggleSelect,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const { data: actor } = useGetUserById(notification.actor);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-dark-2 shadow-sm">
            <Heart className="h-2.5 w-2.5 text-white fill-white" />
          </div>
        );
      case "comment":
        return (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-dark-2 shadow-sm">
            <MessageCircle className="h-2.5 w-2.5 text-white fill-white" />
          </div>
        );
      case "follow":
        return (
          <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1 border-2 border-dark-2 shadow-sm">
            <Users className="h-2.5 w-2.5 text-white fill-white" />
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
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch {
      return "recently";
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.$id);
    }
    if (notification.postId) {
      navigate(`/posts/${notification.postId}`);
    } else {
      navigate(`/profile/${notification.actor}`);
    }
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative border",
        !notification.read
          ? "bg-dark-3/40 border-primary-500/30 shadow-lg shadow-primary-500/5"
          : isSelected 
            ? "bg-dark-3 border-primary-500/20" 
            : "bg-dark-2 border-dark-4 hover:border-light-4/20"
      )}>
      
      {/* Selection Checkbox */}
      <CustomCheckbox 
        checked={isSelected} 
        onChange={() => onToggleSelect(notification.$id)} 
      />

      {/* Avatar with Icon */}
      <div
        className="relative flex-shrink-0 cursor-pointer transition-transform active:scale-90"
        onClick={() => navigate(`/profile/${notification.actor}`)}>
        <img
          src={actor?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="actor"
          className="h-12 w-12 rounded-full object-cover border border-dark-4 shadow-inner"
        />
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
        <div className="flex items-center gap-2">
          <p className="text-light-1 text-sm md:text-base leading-tight">
            <span className="font-bold hover:text-primary-500 transition-colors">
              {actor?.name || "Someone"}
            </span>{" "}
            <span className="text-light-2">{notification.message}</span>
          </p>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 animate-pulse ring-4 ring-primary-500/20" />
          )}
        </div>
        <p className="text-light-3 text-[10px] md:text-xs mt-1.5 flex items-center gap-1">
          <Bell className="h-3 w-3 opacity-50" />
          {formatTime(notification.$createdAt)}
        </p>
      </div>

      {/* Quick Actions (Hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.$id);
            }}
            className="p-2 hover:bg-primary-500/10 rounded-full text-primary-500 transition-colors"
            title="Mark as read">
            <Check className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.$id);
          }}
          className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"
          title="Delete">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());

  const { data: notificationsData, isLoading } = useGetNotifications(user?.id);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const allNotifications = (notificationsData?.documents ||
    []) as unknown as Notification[];

  const unreadNotifications = allNotifications.filter((n) => !n.read);

  const displayedNotifications =
    activeTab === "all" ? allNotifications : unreadNotifications;

  const handleSelectAll = () => {
    if (selectedNotifications.size === displayedNotifications.length && displayedNotifications.length > 0) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(
        new Set(displayedNotifications.map((n) => n.$id))
      );
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedNotifications.size} selected notifications?`)) {
      selectedNotifications.forEach((id) => deleteNotif(id));
      setSelectedNotifications(new Set());
    }
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach((id) => {
      const notif = allNotifications.find((n) => n.$id === id);
      if (notif && !notif.read) {
        markAsRead(id);
      }
    });
    setSelectedNotifications(new Set());
  };

  return (
    <div className="common-container">
      <div className="user-container max-w-4xl w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/20">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="h3-bold md:h2-bold">Activity Center</h2>
              <p className="text-light-3 text-sm md:text-base">
                Track likes, comments, and new followers
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
             <div className="bg-dark-3 px-4 py-2 rounded-xl border border-dark-4">
                <p className="text-xs text-light-4 uppercase tracking-wider font-semibold">Unread</p>
                <p className="text-xl font-bold text-primary-500">{unreadNotifications.length}</p>
             </div>
             <div className="bg-dark-3 px-4 py-2 rounded-xl border border-dark-4">
                <p className="text-xs text-light-4 uppercase tracking-wider font-semibold">Total</p>
                <p className="text-xl font-bold text-light-1">{allNotifications.length}</p>
             </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-0 z-20 py-2 bg-dark-1/80 backdrop-blur-sm">
          <div className="flex items-center p-1.5 bg-dark-3 rounded-2xl w-fit border border-dark-4">
            <button
              onClick={() => setActiveTab("all")}
              className={clsx(
                "px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === "all" ? "bg-primary-500 text-white shadow-md shadow-primary-500/10" : "text-light-3 hover:text-white"
              )}>
              All Activity
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={clsx(
                "px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2",
                activeTab === "unread" ? "bg-primary-500 text-white shadow-md shadow-primary-500/10" : "text-light-3 hover:text-white"
              )}>
              Unread
              {unreadNotifications.length > 0 && (
                <span className={clsx(
                   "text-[10px] px-2 py-0.5 rounded-full font-black",
                   activeTab === "unread" ? "bg-white text-primary-500" : "bg-primary-500 text-white"
                )}>
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {displayedNotifications.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-light-3 text-sm font-semibold hover:text-primary-500 transition-colors group">
                <div className={clsx(
                   "w-5 h-5 rounded border-2 transition-all group-hover:border-primary-500",
                   selectedNotifications.size === displayedNotifications.length ? "bg-primary-500 border-primary-500" : "border-dark-4"
                )}>
                   {selectedNotifications.size === displayedNotifications.length && <Check className="h-4 w-4 text-white" />}
                </div>
                {selectedNotifications.size === displayedNotifications.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}

            {selectedNotifications.size > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                <button
                  onClick={handleMarkSelectedAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-xl text-primary-500 font-bold text-sm transition-all"
                  title="Mark selected as read">
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 font-bold text-sm transition-all"
                  title="Delete selected">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-center w-full h-[400px]">
            <Loader />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-dark-2/50 rounded-[40px] border-2 border-dashed border-dark-4 transition-all hover:border-primary-500/30">
            <div className="p-8 bg-dark-3 rounded-full mb-6 shadow-xl relative">
               <Bell className="h-14 w-14 text-light-4" />
               <div className="absolute top-0 right-0 w-4 h-4 bg-primary-500 rounded-full border-4 border-dark-3" />
            </div>
            <p className="text-light-1 font-black text-2xl mb-3">
              {activeTab === "unread"
                ? "Perfectly Caught Up!"
                : "No Activity Yet"}
            </p>
            <p className="text-light-4 text-center max-w-sm px-6 leading-relaxed">
              {activeTab === "unread"
                ? "You've read all your notifications. Great job staying on top of your social life!"
                : "When people like your photos, comment on your posts, or follow you, you'll find everything right here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 pb-10">
            {displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.$id}
                notification={notification}
                isSelected={selectedNotifications.has(notification.$id)}
                onToggleSelect={handleToggleSelect}
                onMarkAsRead={(id) => markAsRead(id)}
                onDelete={(id) => deleteNotif(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
