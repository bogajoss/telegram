import { useParams } from "react-router-dom";
import { GridPostList, Loader } from "@/components/shared";
import { useGetUserLikedPosts } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { id } = useParams();
  const { data: likedPosts, isLoading, isError } = useGetUserLikedPosts(id || "");

  if (isError) {
    return (
      <div className="w-full">
        <p className="text-light-3 text-center">Failed to load liked posts. Please try again.</p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  if (!likedPosts || !likedPosts.documents || likedPosts.documents.length === 0) {
    return (
      <div className="w-full">
        <p className="text-light-4 text-center w-full">No liked posts yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GridPostList posts={likedPosts.documents as any} showStats={false} />
    </div>
  );
};

export default LikedPosts;
