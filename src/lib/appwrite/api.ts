import { ID, Query, ImageGravity, Models } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import {
  IUpdatePost,
  INewPost,
  INewUser,
  IUpdateUser,
  IPostDocument,
  IUserDocument,
  ISaveDocument,
  ILikeDocument,
  INewComment,
  ICommentDocument,
} from "@/types";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Enrich posts with likes and saves relationship data
 */
async function enrichPosts(posts: any[]) {
  try {
    if (!posts || posts.length === 0) return posts;

    const validPosts = posts.filter((p) => p && p.$id);
    if (validPosts.length === 0) return posts;

    try {
      // Fetch likes and saves in parallel
      const [likes, saves] = await Promise.all([
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.likesCollectionId,
          [Query.limit(1000)]
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.savesCollectionId,
          [Query.limit(1000)]
        )
      ]);

      return posts.map((post) => ({
        ...post,
        likes: post?.$id
          ? ((likes.documents?.filter((like) => {
              const likePostId = typeof like?.post === "string" ? like.post : like?.post?.$id;
              return likePostId === post.$id;
            }) ?? []) as any)
          : [],
        save: post?.$id
          ? ((saves.documents?.filter((save) => {
              const savePostId = typeof save?.post === "string" ? save.post : save?.post?.$id;
              return savePostId === post.$id;
            }) ?? []) as any)
          : [],
      })) as IPostDocument[];
    } catch (error) {
      console.error("Error enriching posts:", error);
      return posts.map((post) => ({
        ...post,
        likes: [],
        save: [],
      })) as IPostDocument[];
    }
  } catch (error) {
    console.error("Error in enrichPosts helper:", error);
    return posts;
  }
}

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    if (!user.email || !user.password || !user.name) {
      throw Error("Email, password, and name are required");
    }

    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error("Failed to create account");

    const avatarUrl = avatars.getInitials(user.name);

    await signInAccount({
      email: user.email,
      password: user.password,
    });

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl.toString(),
    });

    return newUser;
  } catch (error) {
    console.error("Error in createUserAccount:", error);
    return null;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        ...user,
        is_verified: false,
        followers: [],
        followingUsers: [],
      }
    );

    return newUser;
  } catch (error) {
    console.error("Error saving user to DB:", error);
    throw error;
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    const userDoc = currentUser.documents[0];

    // Fetch the full user document to ensure relationships are populated
    const fullUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userDoc.$id
    );

    return {
      ...fullUser,
      following: (fullUser as any).followingUsers || fullUser.following || [],
    } as unknown as IUserDocument;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost as unknown as IPostDocument;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(
  fileId: string,
  width: number = 1200,
  height: number = 1200
) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      width,
      height,
      ImageGravity.Top,
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl.toString();
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const postsResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!postsResult) throw Error;

    // Enrich posts with likes data
    const enrichedPosts = await enrichPosts(
      postsResult.documents as unknown as any[]
    );

    return {
      ...postsResult,
      documents: enrichedPosts,
    } as unknown as Models.DocumentList<IPostDocument>;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({
  pageParam,
}: {
  pageParam: number | string | null;
}) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const postsResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!postsResult) throw Error;

    // Enrich posts with likes data
    const enrichedPosts = await enrichPosts(
      postsResult.documents as unknown as any[]
    );

    return {
      ...postsResult,
      documents: enrichedPosts,
    } as unknown as Models.DocumentList<IPostDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    // Enrich post with likes data
    const enrichedPosts = await enrichPosts([post as unknown as any]);
    return enrichedPosts[0];
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl.toString(),
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost as unknown as IPostDocument;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE POST
export async function likePost(userId: string, postId: string) {
  try {
    // Validate inputs
    if (!userId || !postId) throw Error("userId and postId are required");

    // First check if this like already exists to prevent duplicates
    const existingLikes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      [Query.equal("user", userId), Query.equal("post", postId)]
    );

    // If like already exists, return it instead of creating a duplicate
    if (existingLikes.documents.length > 0) {
      console.log("Like already exists, returning existing record");
      return existingLikes.documents[0] as unknown as ILikeDocument;
    }

    const newLike = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!newLike) throw Error("Failed to create like");

    console.log("👍 Like created successfully, preparing notification...");

    // Get the post to find the creator
    try {
      const post = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
      );

      console.log("📋 Post retrieved:", {
        postId,
        creator: post.creator,
        creatorType: typeof post.creator,
      });

      const postCreatorId =
        typeof post.creator === "string" ? post.creator : post.creator?.$id;

      console.log("👤 Post creator ID:", postCreatorId);
      console.log("🔍 Checking: postCreatorId !== userId?", postCreatorId, "!==", userId, "=>", postCreatorId !== userId);

      // Create notification for the post owner (if not liking own post)
      if (postCreatorId && postCreatorId !== userId) {
        console.log("✉️ Attempting to create notification...");
        await createNotification(
          postCreatorId,
          "like",
          userId,
          postId,
          undefined,
          "liked your post"
        );
      } else {
        console.log("⏭️  Skipping notification (self-like)");
      }
    } catch (notificationError) {
      console.log(
        "⚠️  Notification creation failed, but like was successful:",
        notificationError
      );
    }

    return newLike as unknown as ILikeDocument;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}

// ============================== DELETE LIKED POST
export async function deleteLikedPost(likeRecordId: string) {
  try {
    if (!likeRecordId) throw Error("likeRecordId is required");

    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      likeRecordId
    );

    if (!statusCode) throw Error("Failed to delete like");

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting like:", error);
    throw error;
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    // Check if post is already saved to prevent duplicates
    const existingSaves = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId), Query.equal("post", postId)]
    );

    // If already saved, return existing record
    if (existingSaves.documents.length > 0) {
      console.log("Post already saved, returning existing record");
      return existingSaves.documents[0] as unknown as ISaveDocument;
    }

    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error("Failed to save post");

    return updatedPost as unknown as ISaveDocument;
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    if (!savedRecordId) throw Error("savedRecordId is required");

    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error("Failed to delete saved post");

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting saved post:", error);
    throw error;
  }
}

// ============================== CHECK IF POST IS SAVED
export async function checkIsPostSaved(userId: string, postId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId), Query.equal("post", postId)]
    );

    return result.documents.length > 0 ? result.documents[0] : null;
  } catch (error) {
    console.error("Error checking saved status:", error);
    return null;
  }
}

// ============================== GET USER'S LIKED POSTS
export async function getUserLikedPosts(userId: string) {
  try {
    const likedRecords = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      [Query.equal("user", userId), Query.orderDesc("$createdAt")]
    );

    if (!likedRecords) throw Error;

    // Fetch actual post documents
    const posts = await Promise.all(
      likedRecords.documents.map(async (record: any) => {
        try {
          const postId = typeof record.post === "string" ? record.post : record.post?.$id;
          
          if (!postId) return null;

          const postDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
          );
          return postDoc as unknown as IPostDocument;
        } catch (error) {
          console.log("Error fetching post:", error);
          return null;
        }
      })
    );

    // Filter out any null posts
    const validPosts = posts.filter(
      (post): post is IPostDocument => post !== null
    );

    // Enrich posts with likes and saves data
    const enrichedPosts = await enrichPosts(validPosts);

    return {
      ...likedRecords,
      documents: enrichedPosts,
    } as unknown as Models.DocumentList<IPostDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S SAVED POSTS
export async function getUserSavedPosts(userId: string) {
  try {
    const savedRecords = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId), Query.orderDesc("$createdAt")]
    );

    if (!savedRecords) throw Error;

    // Fetch actual post documents
    const posts = await Promise.all(
      savedRecords.documents.map(async (record: any) => {
        try {
          const postId = typeof record.post === "string" ? record.post : record.post?.$id;
          
          if (!postId) return null;

          const postDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
          );
          return postDoc as unknown as IPostDocument;
        } catch (error) {
          console.log("Error fetching saved post:", error);
          return null;
        }
      })
    );

    // Filter out any null posts
    const validPosts = posts.filter(
      (post): post is IPostDocument => post !== null
    );

    // Enrich posts with likes and saves data
    const enrichedPosts = await enrichPosts(validPosts);

    return {
      ...savedRecords,
      documents: enrichedPosts,
    } as unknown as Models.DocumentList<IPostDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== CREATE COMMENT
export async function createComment(comment: INewComment) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        content: comment.content,
        creator: comment.userId,
        post: comment.postId,
      }
    );

    if (!newComment) throw Error("Failed to create comment");

    // Get the post to find the creator
    try {
      const post = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        comment.postId
      );

      const postCreatorId =
        typeof post.creator === "string" ? post.creator : post.creator?.$id;

      // Create notification for the post owner (if not commenting on own post)
      if (postCreatorId && postCreatorId !== comment.userId) {
        await createNotification(
          postCreatorId,
          "comment",
          comment.userId,
          comment.postId,
          newComment.$id,
          "commented on your post"
        );
      }
    } catch (notificationError) {
      console.log(
        "Notification creation failed, but comment was successful:",
        notificationError
      );
    }

    return newComment as unknown as ICommentDocument;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

// ============================== GET POST COMMENTS
export async function getPostComments(postId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("post", postId), Query.orderDesc("$createdAt")]
    );

    if (!comments) throw Error;

    return comments as unknown as Models.DocumentList<ICommentDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE COMMENT
export async function deleteComment(commentId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const postsResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!postsResult) throw Error;

    // Enrich posts with likes data
    const enrichedPosts = await enrichPosts(
      postsResult.documents as unknown as any[]
    );

    return {
      ...postsResult,
      documents: enrichedPosts,
    } as unknown as Models.DocumentList<IPostDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const postsResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!postsResult) throw Error;

    // Enrich posts with likes data
    const enrichedPosts = await enrichPosts(
      postsResult.documents as unknown as any[]
    );

    return {
      ...postsResult,
      documents: enrichedPosts,
    } as unknown as Models.DocumentList<IPostDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return {
      ...users,
      documents: users.documents.map((user) => ({
        ...user,
        following: (user as any).followingUsers || user.following || [],
      })),
    } as unknown as Models.DocumentList<IUserDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return {
      ...user,
      following: (user as any).followingUsers || user.following || [],
    } as unknown as IUserDocument;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USERS BY IDS
export async function getUsersByIds(userIds: string[]) {
  try {
    if (!userIds || userIds.length === 0) return { documents: [], total: 0 };

    // Appwrite limit for Query.equal with array is 100 usually, but let's just use it
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("$id", userIds)]
    );

    if (!users) throw Error;

    return {
      ...users,
      documents: users.documents.map((user) => ({
        ...user,
        following: (user as any).followingUsers || user.following || [],
      })),
    } as unknown as Models.DocumentList<IUserDocument>;
  } catch (error) {
    console.log(error);
  }
}

// ============================== FOLLOW / UNFOLLOW USER
export async function followUser(
  userId: string,
  followerId: string,
  followingArray: string[]
) {
  try {
    // 1. Update the follower's "following" list
    const updatedFollower = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      followerId,
      {
        followingUsers: followingArray,
      }
    );

    if (!updatedFollower) throw Error;

    // 2. Update the target user's "followers" list
    const targetUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!targetUser) throw Error;

    let followersArray =
      (targetUser.followers as any[])?.map((u: any) =>
        typeof u === "string" ? u : u.$id || u.id
      ) || [];

    const isNowFollowing = followingArray.includes(userId);

    if (isNowFollowing) {
      if (!followersArray.includes(followerId)) {
        followersArray.push(followerId);
      }
    } else {
      followersArray = followersArray.filter((id: string) => id !== followerId);
    }

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        followers: followersArray,
      }
    );

    // 3. Create notification for the target user (if it's a follow action)
    if (isNowFollowing && userId !== followerId) {
      try {
        await createNotification(
          userId,
          "follow",
          followerId,
          undefined,
          undefined,
          "started following you"
        );
      } catch (notifError) {
        console.error("Failed to create follow notification:", notifError);
      }
    }

    return {
      ...updatedFollower,
      following:
        (updatedFollower as any).followingUsers ||
        updatedFollower.following ||
        [],
    } as unknown as IUserDocument;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl.toString(),
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser as unknown as IUserDocument;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

// Create notification
export async function createNotification(
  userId: string,
  type: "like" | "comment" | "follow",
  actorId: string,
  postId?: string,
  commentId?: string,
  message?: string
) {
  try {
    console.log("🔔 Creating notification:", {
      userId,
      type,
      actorId,
      postId,
      commentId,
      message,
      collectionId: appwriteConfig.notificationsCollectionId,
      databaseId: appwriteConfig.databaseId,
    });

    if (!userId || !type || !actorId)
      throw Error("Missing required notification fields");

    const notification = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      {
        userId: userId, // Backwards compatibility
        recipient: userId, // Who receives the notification
        type, // like, comment, follow
        actorId: actorId, // Backwards compatibility
        actor: actorId, // Who performed the action
        postId: postId || null,
        commentId: commentId || null,
        message:
          message ||
          (type === "follow" ? "started following you" : `${type}d your post`),
        read: false,
      }
    );

    console.log("✅ Notification created successfully:", notification.$id);
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    // Don't throw - notifications shouldn't break the app
    return null;
  }
}

// Get user notifications
export async function getUserNotifications(userId: string, limit: number = 20) {
  try {
    if (!userId) throw Error("userId is required");

    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipient", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { documents: [], total: 0 };
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    if (!userId) throw Error("userId is required");

    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("recipient", userId), Query.equal("read", false)]
    );

    return notifications.total;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    if (!notificationId) throw Error("notificationId is required");

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { read: true }
    );

    return updated;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    if (!userId) throw Error("userId is required");

    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipient", userId),
        Query.equal("read", false),
        Query.limit(1000),
      ]
    );

    // Update all unread notifications
    await Promise.all(
      notifications.documents.map((notification: any) =>
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.notificationsCollectionId,
          notification.$id,
          { read: true }
        )
      )
    );

    return { status: "Ok" };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { status: "error" };
  }
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  try {
    if (!notificationId) throw Error("notificationId is required");

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId
    );

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}
