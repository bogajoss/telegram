import { useParams } from "react-router-dom";
import { GridPostList, Loader } from "@/components/shared";
import { useGetUserLikedPosts } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { id } = useParams();
  const { data: likedPosts, isLoading } = useGetUserLikedPosts(id || "");

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="w-full">
      {!likedPosts || likedPosts.documents.length === 0 ? (
        <p className="text-light-4 text-center w-full">No liked posts</p>
      ) : (
        <GridPostList posts={likedPosts.documents as any} showStats={false} />
      )}
    </div>
  );
};

export default LikedPosts;
