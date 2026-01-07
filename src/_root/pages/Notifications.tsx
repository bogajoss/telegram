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

const CustomCheckbox = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: () => void 
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={clsx(
      "flex-shrink-0 transition-all duration-200 rounded-md hover:bg-transparent p-0 h-auto w-auto",
      checked ? "text-primary-500" : "text-dark-4 hover:text-light-4"
    )}>
    {checked ? (
      <CheckSquare className="h-6 w-6" />
    ) : (
      <Square className="h-6 w-6" />
    )}
  </Button>
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
          <div className="absolute -bottom-1 -right-1 bg-red rounded-full p-1 border-2 border-dark-2">
            <Heart className="h-2 w-2 text-white fill-white" />
          </div>
        );
      case "comment":
        return (
          <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1 border-2 border-dark-2">
            <MessageCircle className="h-2 w-2 text-white fill-white" />
          </div>
        );
      case "follow":
        return (
          <div className="absolute -bottom-1 -right-1 bg-secondary-500 rounded-full p-1 border-2 border-dark-2">
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
        "flex items-center gap-4 p-4 rounded-2xl transition-all group relative border w-full",
        !notification.read
          ? "bg-dark-3 border-dark-4"
          : "bg-dark-2 border-dark-4 hover:bg-dark-3"
      )}>
      
      <CustomCheckbox 
        checked={isSelected} 
        onChange={() => onToggleSelect(notification.$id)} 
      />

      <div
        className="relative flex-shrink-0 cursor-pointer"
        onClick={() => navigate(`/profile/${notification.actor}`)}>
        <img
          src={actor?.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="actor"
          className="h-10 w-10 rounded-full object-cover"
        />
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
        <div className="flex items-center gap-2">
          <p className="small-medium md:base-medium text-light-1 line-clamp-1">
            <span className="font-bold">{actor?.name || "Someone"}</span>{" "}
            {notification.message}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="subtle-semibold text-light-3">
          {formatTime(notification.$createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.$id);
            }}
            className="h-8 w-8 hover:bg-dark-4 text-primary-500"
            title="Mark as read">
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.$id);
          }}
          className="h-8 w-8 hover:bg-dark-4 text-red"
          title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
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
    selectedNotifications.forEach((id) => deleteNotif(id));
    setSelectedNotifications(new Set());
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
      <div className="user-container">
        <div className="flex-between w-full">
          <div className="flex gap-2 items-center">
            <Bell className="h-8 w-8 text-white" />
            <h2 className="h3-bold md:h2-bold text-left w-full">Notifications</h2>
          </div>

          <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2">
            <Button
              variant="ghost" 
              onClick={handleSelectAll}
              className="small-medium md:base-medium text-light-3 hover:text-primary-500 hover:bg-transparent transition-colors mr-2 h-auto p-0"
            >
              {selectedNotifications.size === displayedNotifications.length && displayedNotifications.length > 0 ? "Deselect All" : "Select All"}
            </Button>
            <div className="w-[1px] h-4 bg-dark-4" />
            <Button 
              variant="ghost"
              onClick={() => setActiveTab("all")}
              className={`small-medium md:base-medium h-auto p-0 hover:bg-transparent ${activeTab === 'all' ? 'text-primary-500' : 'text-light-2 hover:text-primary-500'}`}
            >
              All
            </Button>
            <div className="w-[1px] h-4 bg-dark-4" />
            <Button 
              variant="ghost"
              onClick={() => setActiveTab("unread")}
              className={`small-medium md:base-medium h-auto p-0 hover:bg-transparent ${activeTab === 'unread' ? 'text-primary-500' : 'text-light-2 hover:text-primary-500'}`}
            >
              Unread
            </Button>
          </div>
        </div>

        {selectedNotifications.size > 0 && (
          <div className="flex items-center gap-4 w-full p-4 bg-dark-3 rounded-xl animate-in fade-in slide-in-from-top-2">
            <p className="small-medium text-light-3">{selectedNotifications.size} selected</p>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="default"
                onClick={handleMarkSelectedAsRead}
                className="shad-button_primary px-5 py-2 text-xs h-8"
              >
                Mark Read
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                className="shad-button_dark_4 px-5 py-2 text-xs !bg-red h-8"
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="w-full">
          {isLoading && !notificationsData ? (
            <Loader />
          ) : displayedNotifications.length === 0 ? (
            <p className="text-light-4 mt-10 text-center w-full">No notifications found</p>
          ) : (
            <ul className="flex flex-col gap-4 w-full">
              {displayedNotifications.map((notification) => (
                <li key={notification.$id} className="w-full">
                  <NotificationItem
                    notification={notification}
                    isSelected={selectedNotifications.has(notification.$id)}
                    onToggleSelect={handleToggleSelect}
                    onMarkAsRead={(id) => markAsRead(id)}
                    onDelete={(id) => deleteNotif(id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
