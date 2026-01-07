import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Heart, Bookmark } from "lucide-react";

import {
  useLikePost,
  useDeleteLikedPost,
  useSavePost,
  useDeleteSavedPost,
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

  const likedPostRecord = post?.likes?.find((record: ILikeDocument) => {
    const recordUserId =
      typeof record?.user === "string" ? record.user : record?.user?.$id;
    return recordUserId === userId;
  });

  useEffect(() => {
    setIsLiked(!!likedPostRecord);
  }, [likedPostRecord, userId]);

  const savedPostRecord = post?.save?.find((record: ISaveDocument) => {
    const recordUserId =
      typeof record?.user === "string" ? record.user : record?.user?.$id;
    return recordUserId === userId;
  });

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [userId, savedPostRecord]);

  const handleLikePost = (
    e: React.MouseEvent<SVGElement, MouseEvent>
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
        },
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
        },
      }
    );
  };

  const handleSavePost = (
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (isSavingInProgress) return;

    if (savedPostRecord) {
      setIsSavingInProgress(true);
      setIsSaved(false);
      deleteSavePost(savedPostRecord.$id, {
        onSuccess: () => setIsSavingInProgress(false),
        onError: () => {
          setIsSaved(true);
          setIsSavingInProgress(false);
        },
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
        },
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
        <Heart
          size={20}
          onClick={(e) => handleLikePost(e)}
          className={`cursor-pointer transition-opacity ${
            isLikingInProgress ? "opacity-50 pointer-events-none" : ""
          } ${isLiked ? "fill-red text-red" : "text-primary-500"}`}
        />
        <p className="small-medium lg:base-medium">
          {post?.likes?.length ?? 0}
        </p>
      </div>

      <div className="flex gap-2">
        <Bookmark
          size={20}
          onClick={(e) => handleSavePost(e)}
          className={`cursor-pointer transition-opacity ${
            isSavingInProgress ? "opacity-50 pointer-events-none" : ""
          } ${isSaved ? "fill-primary-500 text-primary-500" : "text-primary-500"}`}
        />
      </div>
    </div>
  );
};

export default PostStats;
