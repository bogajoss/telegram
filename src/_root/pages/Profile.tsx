import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { Plus, Edit, Grid, Heart, Bookmark } from "lucide-react";

import { Button, Spinner } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikedPosts, SavedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetUserById,
  useFollowUser,
  useGetCurrentUser,
  useGetUserPosts,
} from "@/lib/react-query/queries";
import { GridPostList, Loader, VerifiedBadge, UserList } from "@/components/shared";

interface StabBlockProps {
  value: string | number;
  label: string;
  onClick?: () => void;
}

const StatBlock = ({ value, label, onClick }: StabBlockProps) => (
  <div
    className={`flex-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    onClick={onClick}
  >
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const { data: currentUser } = useGetUserById(id || "");
  const { data: userPosts, isLoading: isPostsLoading } = useGetUserPosts(
    id || ""
  );
  const { data: loggedInUser } = useGetCurrentUser();
  const { mutate: followUser, isPending: isFollowPending } = useFollowUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const isFollowing =
    loggedInUser?.following?.some((u: any) => {
      const followingId = typeof u === "string" ? u : u?.$id;
      return followingId === currentUser?.$id;
    }) ?? false;

  const handleFollowUser = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser?.$id || !loggedInUser?.$id) {
      console.error("Missing user IDs for follow action");
      return;
    }

    let followingArray = (loggedInUser?.following ?? []).map((u: any) =>
      typeof u === "string" ? u : u?.$id
    ) as string[];

    if (isFollowing) {
      followingArray = followingArray.filter(
        (followingId: string) => followingId !== currentUser.$id
      );
    } else {
      followingArray.push(currentUser.$id);
    }

    followUser({
      userId: currentUser.$id,
      followerId: loggedInUser.$id,
      followingArray,
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-inner_container">

        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <Avatar className="w-28 h-28 lg:h-36 lg:w-36">
            <AvatarImage
              src={currentUser?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="object-cover"
            />
            <AvatarFallback className="bg-dark-4 text-light-1 text-2xl">
              {currentUser?.name?.substring(0, 2).toUpperCase() || "CN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full flex items-center justify-center xl:justify-start gap-1">
                {currentUser?.name || "Unknown User"}
                {currentUser?.is_verified && (
                  <VerifiedBadge className="w-6 h-6 lg:w-8 lg:h-8" />
                )}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser?.username || "unknown"}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock
                value={userPosts?.documents?.length ?? 0}
                label="Posts"
              />
              <StatBlock
                value={currentUser?.followers?.length ?? 0}
                label="Followers"
                onClick={() => setShowFollowers(true)}
              />
              <StatBlock
                value={currentUser?.following?.length ?? 0}
                label="Following"
                onClick={() => setShowFollowing(true)}
              />
            </div>

            {showFollowers && (
              <UserList
                title="Followers"
                userIds={currentUser?.followers as string[]}
                onClose={() => setShowFollowers(false)}
              />
            )}

            {showFollowing && (
              <UserList
                title="Following"
                userIds={currentUser?.following as string[]}
                onClose={() => setShowFollowing(false)}
              />
            )}

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm line-clamp-3">
              {currentUser?.bio || ""}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${user.id !== currentUser.$id && "hidden"
                  }`}>
                <Edit width={20} height={20} />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === currentUser.$id && "hidden"}`}>
              <Button
                type="button"
                className="shad-button_primary px-8"
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
                    <Plus size={20} /> Follow
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div >

      {
        currentUser.$id === user.id && (
          <div className="flex max-w-5xl w-full">
            <Link
              to={`/profile/${id}`}
              className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"
                }`}>
              <Grid width={20} height={20} />
              Posts
            </Link>
            <Link
              to={`/profile/${id}/liked-posts`}
              className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
                }`}>
              <Heart width={20} height={20} />
              Liked Posts
            </Link>
            <Link
              to={`/profile/${id}/saved-posts`}
              className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/saved-posts` && "!bg-dark-3"
                }`}>
              <Bookmark width={20} height={20} />
              Saved Posts
            </Link>
          </div>
        )
      }

      < Routes >
        <Route
          index
          element={
            isPostsLoading ? (
              <Loader />
            ) : (
              <GridPostList
                posts={userPosts?.documents as any}
                showUser={false}
              />
            )
          }
        />
        {
          currentUser.$id === user.id && (
            <Route path="/liked-posts" element={<LikedPosts />} />
          )
        }
        {
          currentUser.$id === user.id && (
            <Route path="/saved-posts" element={<SavedPosts />} />
          )
        }
      </Routes >
      <Outlet />
    </div >
  );
};

export default Profile;
