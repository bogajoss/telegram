import { Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";
import { IPostDocument, IUserDocument } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
              {posts.documents.map((post: IPostDocument, index: number) => (
                <li key={post.$id} className="flex flex-col w-full gap-9">
                  <div className="flex justify-center w-full">
                    <PostCard post={post} />
                  </div>
                  
                  {/* Insert "People You May Know" after the second post (index 1) */}
                  {index === 1 && creators?.documents && creators.documents.length > 0 && (
                    <div className="w-full max-w-screen-sm mx-auto overflow-hidden">
                      <h3 className="h3-bold text-light-1 mb-4 px-2">People You May Know</h3>
                      <ScrollArea className="w-full whitespace-nowrap rounded-md border border-dark-4 bg-dark-2 p-4 max-w-[100vw]">
                        <div className="flex w-max space-x-4">
                          {creators.documents.map((creator: IUserDocument) => (
                            <div key={creator.$id} className="w-[180px] shrink-0">
                              <UserCard user={creator} />
                            </div>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-light-3 text-center">
              No posts yet. Check back soon!
            </p>
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
