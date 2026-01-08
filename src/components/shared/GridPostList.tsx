import { Link } from "react-router-dom";

import { PostStats, VerifiedBadge } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { IPostDocument } from "@/types";
import { useGetUserById } from "@/lib/react-query/queries";

type GridPostListProps = {
  posts: IPostDocument[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostCard = ({
  post,
  showUser,
  showStats,
  userId,
}: {
  post: IPostDocument;
  showUser: boolean;
  showStats: boolean;
  userId: string;
}) => {
  const creatorId =
    typeof post?.creator === "string" ? post.creator : post?.creator?.$id;

  const { data: fetchedCreator } = useGetUserById(creatorId || "");

  if (!post || !post.$id) return null;
  const creator =
    typeof post.creator === "string" ? fetchedCreator : post.creator;

  return (
    <li className="relative aspect-square">
      <Link to={`/posts/${post.$id}`} className="grid-post_link">
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="grid-post_user">
        {showUser && creator && (
          <div className="flex items-center justify-start gap-2 flex-1">
            <img
              src={
                (creator as any)?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-8 h-8 rounded-full"
            />
            <p className="line-clamp-1 flex items-center gap-1">
              {(creator as any)?.name || "Unknown"}
              {(creator as any)?.is_verified && (
                <VerifiedBadge className="w-3 h-3" />
              )}
            </p>
          </div>
        )}
        {showStats && <PostStats post={post} userId={userId} />}
      </div>
    </li>
  );
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  if (!posts || posts.length === 0) return null;

  return (
    <ul className="grid-container">
      {posts.map((post) =>
        post && post.$id ? (
          <GridPostCard
            key={post.$id}
            post={post}
            showUser={showUser}
            showStats={showStats}
            userId={user.id}
          />
        ) : null
      )}
    </ul>
  );
};

export default GridPostList;
