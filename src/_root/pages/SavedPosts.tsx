import { useParams } from "react-router-dom";
import { GridPostList, Loader } from "@/components/shared";
import { useGetUserSavedPosts } from "@/lib/react-query/queries";

const SavedPosts = () => {
  const { id } = useParams();
  const { data: savedPosts, isLoading, isError } = useGetUserSavedPosts(id || "");

  if (isError) {
    return (
      <div className="w-full">
        <p className="text-light-3 text-center">
          Failed to load saved posts. Please try again.
        </p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  if (!savedPosts || !savedPosts.documents || savedPosts.documents.length === 0) {
    return (
      <div className="w-full">
        <p className="text-light-4 text-center w-full">No saved posts yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GridPostList posts={savedPosts.documents as any} showStats={false} />
    </div>
  );
};

export default SavedPosts;
