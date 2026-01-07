import { Link } from "react-router-dom";
import { Edit } from "lucide-react";

import { PostStats, VerifiedBadge } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { IPostDocument } from "@/types";

type PostCardProps = {
  post: IPostDocument;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  const creatorId =
    typeof post.creator === "string"
      ? post.creator
      : post.creator?.$id || (post.creator as any)?.id;

  const { data: fetchedCreator } = useGetUserById(creatorId || "");

  const creator =
    typeof post.creator === "string" ? fetchedCreator : post.creator;

  if (!creator) return null;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creatorId || ""}`}>
            <img
              src={
                (creator as any)?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1 flex items-center">
              {(creator as any)?.name || "Unknown"}
              {(creator as any)?.is_verified && <VerifiedBadge />}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== creatorId && "hidden"}`}>
          <Edit width={20} height={20} />
        </Link>
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags?.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
        />
      </Link>

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
