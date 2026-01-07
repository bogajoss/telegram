import { Client, Databases, Query } from "appwrite";
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"']*)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});

const client = new Client()
    .setEndpoint(env.VITE_APPWRITE_URL)
    .setProject(env.VITE_APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function test() {
    try {
        const userId = '695debd000236e4e3132';
        const user = await databases.getDocument(
            env.VITE_APPWRITE_DATABASE_ID,
            env.VITE_APPWRITE_USER_COLLECTION_ID,
            userId
        );
        console.log('User liked posts:', user.liked ? user.liked.length : 'undefined');
        
        // Try to like via SDK
        const postId = '695dec32001769fe7305';
        console.log('Liking post via SDK...');
        const updatedPost = await databases.updateDocument(
            env.VITE_APPWRITE_DATABASE_ID,
            env.VITE_APPWRITE_POST_COLLECTION_ID,
            postId,
            { likes: [userId] }
        );
        console.log('Updated Post Likes count:', updatedPost.likes.length);
        
        // Fetch user again
        const userAfter = await databases.getDocument(
            env.VITE_APPWRITE_DATABASE_ID,
            env.VITE_APPWRITE_USER_COLLECTION_ID,
            userId
        );
        console.log('User liked posts count after:', userAfter.liked ? userAfter.liked.length : 'undefined');
    } catch (e) {
        console.error(e);
    }
}
test();
