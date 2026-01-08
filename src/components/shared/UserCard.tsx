import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button, Spinner } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IUserDocument } from "@/types";
import { useFollowUser, useGetCurrentUser } from "@/lib/react-query/queries";
import { VerifiedBadge } from "./index";

type UserCardProps = {
  user: IUserDocument;
};

const UserCard = ({ user }: UserCardProps) => {
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: followUser, isPending: isFollowPending } = useFollowUser();

  const userId = user.$id || (user as any).id;
  const isFollowing = currentUser?.following?.some((u: any) =>
    typeof u === "string" ? u === userId : u.$id === userId
  );

  const handleFollowUser = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let followingArray =
      currentUser?.following?.map((u: any) =>
        typeof u === "string" ? u : u.$id
      ) || [];

    if (isFollowing) {
      followingArray = followingArray.filter(
        (followingId: string) => followingId !== userId
      );
    } else {
      followingArray.push(userId);
    }

    followUser({ userId, followerId: currentUser?.$id || "", followingArray });
  };

  return (
    <Link to={`/profile/${userId || ""}`} className="user-card">
      <Avatar className="w-14 h-14">
        <AvatarImage
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
        />
        <AvatarFallback className="bg-dark-4 text-light-1">
          {user.name?.substring(0, 2).toUpperCase() || "CN"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1 flex items-center justify-center">
          {user.name}
          {user.is_verified && <VerifiedBadge />}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className="shad-button_primary px-5"
        onClick={handleFollowUser}
        disabled={isFollowPending}>
        {isFollowPending ? (
          <div className="flex-center gap-2">
            <Spinner /> Loading...
          </div>
        ) : isFollowing ? (
          "Unfollow"
        ) : (
          <div className="flex items-center gap-2">
            <Plus size={18} /> Follow
          </div>
        )}
      </Button>
    </Link>
  );
};

export default UserCard;
