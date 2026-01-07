import { Link, useLocation } from "react-router-dom";

import { bottombarLinks } from "@/constants";
import { useGetUnreadCount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const Bottombar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { data: unreadCount = 0 } = useGetUnreadCount(user?.id);

  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        const IconComponent = link.icon;

        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`${
              isActive && "rounded-[10px] bg-primary-500 "
            } flex-center flex-col gap-1 p-2 transition relative`}>
            <IconComponent
              className={`h-4 w-4 ${isActive ? "text-white" : "text-light-3"}`}
            />
            {link.label === "Notifications" && unreadCount > 0 && (
              <span className="absolute top-1.5 right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

            <p className="tiny-medium text-light-2">{link.label}</p>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;
