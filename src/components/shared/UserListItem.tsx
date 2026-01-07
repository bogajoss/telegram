import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { IUserDocument } from "@/types";
import { useFollowUser, useGetCurrentUser } from "@/lib/react-query/queries";
import { VerifiedBadge } from "./index";

type UserListItemProps = {
  user: IUserDocument;
};

const UserListItem = ({ user }: UserListItemProps) => {
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
    <div className="flex items-center justify-between w-full py-2">
      <Link to={`/profile/${userId || ""}`} className="flex items-center gap-3 flex-1">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-10 h-10 object-cover"
        />
        <div className="flex flex-col">
          <p className="base-medium text-light-1 line-clamp-1 flex items-center gap-1">
            {user.name}
            {user.is_verified && <VerifiedBadge className="w-4 h-4" />}
          </p>
          <p className="small-regular text-light-3 line-clamp-1">
            @{user.username}
          </p>
        </div>
      </Link>

      {currentUser?.$id !== userId && (
        <Button
          type="button"
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          className={`${isFollowing ? 'bg-dark-4 border-none text-light-1' : 'shad-button_primary'} px-5 h-8`}
          onClick={handleFollowUser}
          disabled={isFollowPending}
        >
          {isFollowPending ? (
            <div className="flex-center gap-2">
              <Spinner />
            </div>
          ) : isFollowing ? (
            "Following"
          ) : (
            <div className="flex items-center gap-2">
              <Plus size={16} /> Follow
            </div>
          )}
        </Button>
      )}
    </div>
  );
};

export default UserListItem;
