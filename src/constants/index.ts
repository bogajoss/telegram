import { Home, Compass, Users, Bell, Plus } from "lucide-react";

export const sidebarLinks = [
  {
    icon: Home,
    route: "/",
    label: "Home",
  },
  {
    icon: Compass,
    route: "/explore",
    label: "Explore",
  },
  {
    icon: Users,
    route: "/all-users",
    label: "People",
  },
  {
    icon: Bell,
    route: "/notifications",
    label: "Notifications",
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Create Post",
  },
];

export const bottombarLinks = [
  {
    icon: Home,
    route: "/",
    label: "Home",
  },
  {
    icon: Compass,
    route: "/explore",
    label: "Explore",
  },
  {
    icon: Bell,
    route: "/notifications",
    label: "Notifications",
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Create",
  },
];
