import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import { Button, Input, Spinner } from "@/components/ui";
import { Loader, VerifiedBadge } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useGetUserById,
  useGetPostComments,
  useCreateComment,
  useDeleteComment,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const CommentItem = ({
  comment,
  userId,
  onDelete,
}: {
  comment: any;
  userId: string;
  onDelete: (id: string) => void;
}) => {
  const { data: fetchedCreator } = useGetUserById(
    typeof comment.creator === "string" ? comment.creator : ""
  );

  const creator =
    typeof comment.creator === "string" ? fetchedCreator : comment.creator;

  if (!creator) return null;

  return (
    <div className="flex gap-3 items-start">
      <Link to={`/profile/${creator.$id}`}>
        <img
          src={creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="w-8 h-8 rounded-full"
        />
      </Link>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <p className="small-semibold text-light-1 flex items-center gap-1">
            {creator.name}
            {(creator as any)?.is_verified && (
              <VerifiedBadge className="w-3 h-3" />
            )}
          </p>
          {userId === creator.$id && (
            <Trash2
              size={16}
              className="cursor-pointer text-light-3 hover:text-red"
              onClick={() => onDelete(comment.$id)}
            />
          )}
        </div>
        <p className="small-medium text-light-2">{comment.content}</p>
        <p className="subtle-semibold text-light-3">
          {multiFormatDateString(comment.$createdAt)}
        </p>
      </div>
    </div>
  );
};

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const [comment, setComment] = useState("");

  const { data: post, isLoading } = useGetPostById(id);
  const { data: comments, isLoading: isCommentsLoading } = useGetPostComments(
    id || ""
  );
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment();
  const { mutate: deleteComment } = useDeleteComment();

  const creatorId =
    typeof post?.creator === "string"
      ? post.creator
      : post?.creator?.$id || (post?.creator as any)?.id;

  const { data: fetchedCreator } = useGetUserById(
    typeof post?.creator === "string" ? post.creator : ""
  );

  const creator =
    typeof post?.creator === "string" ? fetchedCreator : post?.creator;

  const { data: userPosts, isLoading: isUserPostLoading } =
    useGetUserPosts(creatorId);
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents?.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId || "" });
    navigate(-1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    createComment({
      content: comment,
      postId: id || "",
      userId: user.id,
    });
    setComment("");
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <ArrowLeft width={24} height={24} />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <Carousel className="w-full xl:w-[48%] rounded-t-[30px] xl:rounded-l-[24px] xl:rounded-tr-none bg-dark-1 overflow-hidden">
            <CarouselContent>
              <CarouselItem>
                <img
                  src={post?.imageUrl}
                  alt="creator"
                  className="post_details-img w-full h-full object-contain"
                />
              </CarouselItem>
            </CarouselContent>
            <div className="hidden">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${creatorId || ""}`}
                className="flex items-center gap-3">
                <img
                  src={
                    (creator as any)?.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1 flex items-center gap-1">
                    {(creator as any)?.name}
                    {(creator as any)?.is_verified && <VerifiedBadge />}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                  </div>
                </div>
              </Link>

              <div
                className={`flex-center gap-4 ${
                  user.id !== creatorId && "hidden"
                }`}>
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== creatorId && "hidden"}`}>
                  <Edit width={24} height={24} />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    user.id !== creatorId && "hidden"
                  }`}>
                  <Trash2 width={24} height={24} />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags?.map((tag: string, index: number) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>

            {/* COMMENTS SECTION */}
            <div className="flex flex-col gap-4 w-full mt-4">
              <hr className="border w-full border-dark-4/80" />
              <h4 className="body-bold text-light-1">Comments</h4>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Write a comment..."
                  className="shad-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  type="submit"
                  className="shad-button_primary"
                  disabled={isCreatingComment}>
                  {isCreatingComment ? (
                    <div className="flex-center gap-2">
                      <Spinner />
                    </div>
                  ) : (
                    "Post"
                  )}
                </Button>
              </form>

              <div className="flex flex-col gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                {isCommentsLoading ? (
                  <Loader />
                ) : comments?.documents.length === 0 ? (
                  <p className="text-light-4 small-medium">No comments yet.</p>
                ) : (
                  comments?.documents.map((c: any) => (
                    <CommentItem
                      key={c.$id}
                      comment={c}
                      userId={user.id}
                      onDelete={handleDeleteComment}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
