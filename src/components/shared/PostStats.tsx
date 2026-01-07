import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  useLikePost,
  useDeleteLikedPost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import { IPostDocument, ISaveDocument, ILikeDocument } from "@/types";

type PostStatsProps = {
  post: IPostDocument;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLikingInProgress, setIsLikingInProgress] = useState(false);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: deleteLikedPost } = useDeleteLikedPost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const likedPostRecord = post?.likes?.find(
    (record: ILikeDocument) => (record.user.$id || (record.user as any)) === userId
  );

  useEffect(() => {
    setIsLiked(!!likedPostRecord);
  }, [likedPostRecord]);

  const savedPostRecord = currentUser?.save?.find(
    (record: ISaveDocument) => record.post.$id === post.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser, savedPostRecord]);

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    // Prevent duplicate likes while request is in progress
    if (isLikingInProgress) return;

    if (likedPostRecord) {
      setIsLikingInProgress(true);
      setIsLiked(false);
      deleteLikedPost(likedPostRecord.$id, {
        onSuccess: () => setIsLikingInProgress(false),
        onError: () => {
          setIsLiked(true);
          setIsLikingInProgress(false);
        }
      });
      return;
    }

    // Prevent creating duplicate likes
    setIsLikingInProgress(true);
    setIsLiked(true);
    likePost(
      { userId: userId, postId: post.$id },
      {
        onSuccess: () => setIsLikingInProgress(false),
        onError: () => {
          setIsLiked(false);
          setIsLikingInProgress(false);
        }
      }
    );
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    // Prevent duplicate saves while request is in progress
    if (isSavingInProgress) return;

    if (savedPostRecord) {
      setIsSavingInProgress(true);
      setIsSaved(false);
      deleteSavePost(savedPostRecord.$id, {
        onSuccess: () => setIsSavingInProgress(false),
        onError: () => {
          setIsSaved(true);
          setIsSavingInProgress(false);
        }
      });
      return;
    }

    setIsSavingInProgress(true);
    setIsSaved(true);
    savePost(
      { userId: userId, postId: post.$id },
      {
        onSuccess: () => setIsSavingInProgress(false),
        onError: () => {
          setIsSaved(false);
          setIsSavingInProgress(false);
        }
      }
    );
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={`${
            isLiked
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className={`cursor-pointer transition-opacity ${isLikingInProgress ? "opacity-50 pointer-events-none" : ""}`}
        />
        <p className="small-medium lg:base-medium">{post?.likes?.length || 0}</p>
      </div>

      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={20}
          height={20}
          className={`cursor-pointer transition-opacity ${isSavingInProgress ? "opacity-50 pointer-events-none" : ""}`}
          onClick={(e) => handleSavePost(e)}
        />
      </div>
    </div>
  );
};

export default PostStats;
