import { IPostDocument, IUser } from "@/types";

/**
 * Ranks a list of posts based on a weighted scoring algorithm.
 * 
 * Scoring System:
 * - Recency: Newness is critical.
 *   - < 2 hours: +30 points
 *   - < 12 hours: +20 points
 *   - < 24 hours: +10 points
 * - Engagement:
 *   - Likes: +2 points each
 *   - Comments: +4 points each
 *   - Saves: +5 points each
 * - Affinity (Relationship):
 *   - Creator is Followed by User: +50 points (Critical for "Social" feeling)
 *   - Creator is Verified: +10 points
 * 
 * @param posts List of posts to rank
 * @param currentUser The current logged-in user (to check following status)
 * @returns Sorted list of posts
 */
export const rankPosts = (posts: IPostDocument[], currentUser: IUser | null): IPostDocument[] => {
    if (!posts) return [];
    if (!currentUser) return posts; // Return default order if no user

    const scoredPosts = posts.map((post) => {
        let score = 0;

        // 1. Recency Score
        const hoursAgo = (Date.now() - new Date(post.$createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 2) score += 30;
        else if (hoursAgo < 12) score += 20;
        else if (hoursAgo < 24) score += 10;
        else score -= (hoursAgo * 0.5); // Decay for very old posts

        // 2. Engagement Score
        // Length of 'likes' array (relationship)
        const likeCount = post.likes?.length || 0;
        const commentCount = post.comments?.length || 0; // Assuming we have comments loaded or count
        const saveCount = post.save?.length || 0;

        score += (likeCount * 2);
        score += (commentCount * 4);
        score += (saveCount * 5);

        // 3. Affinity Score
        // Check if current user follows the creator
        // We need to assume currentUser has a 'following' list of IDs.
        // If currentUser.following is not available or structure is different, we skip.

        // NOTE: types say `following` is IUserDocument[] | string[].
        // We safely check if the creator's ID is in the user's following list.
        if ((currentUser as any).following) {
            const isFollowing = (currentUser as any).following.some((f: any) => {
                const id = typeof f === 'string' ? f : f.$id;
                return id === post.creator?.$id;
            });
            if (isFollowing) score += 50;
        }

        if (post.creator?.is_verified) score += 10;

        // 4. Interaction History (Bonus)
        // If user has Liked this creator before (would require more complex history tracking)

        return { ...post, _score: score };
    });

    // Sort by score descending
    scoredPosts.sort((a, b) => b._score - a._score);

    // Return original post objects (stripped of _score if you strict type, but JS is loose)
    return scoredPosts;
};
