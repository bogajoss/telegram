import { Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";
import { IPostDocument } from "@/types";

const Home = () => {
  // const { toast } = useToast();

  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">
            Something went wrong. Please refresh and try again.
          </p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">
            Failed to load top creators.
          </p>
        </div>
      </div>
    );
  }

  if (!posts?.documents || !creators?.documents) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isPostLoading ? (
            <Loader />
          ) : posts.documents.length > 0 ? (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts.documents.map((post: IPostDocument) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-light-3 text-center">No posts yet. Check back soon!</p>
          )}
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Top Creators</h3>
        {isUserLoading ? (
          <Loader />
        ) : creators.documents.length > 0 ? (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators.documents.map((creator) => (
              <li key={creator?.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-light-3">No creators found</p>
        )}
      </div>
    </div>
  );
};

export default Home;
