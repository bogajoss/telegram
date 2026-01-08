import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { NotificationBell } from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <span className="h3-bold">Genjam</span>
        </Link>

        <div className="flex gap-2 sm:gap-4 items-center">
          <ThemeToggle />
          <NotificationBell />
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}>
            <LogOut className="h-5 w-5" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                className="object-cover"
              />
              <AvatarFallback className="bg-dark-4 text-light-1 text-xs">
                {user.name?.substring(0, 2).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
