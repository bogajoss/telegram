import fs from 'fs';
import path from 'path';
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"']*)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});
const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': env.APPWRITE_API_KEY,
};
async function verify() {
  const postsRes = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_POST_COLLECTION_ID + '/documents', { headers });
  const postsData = await postsRes.json();
  const postWithLikes = postsData.documents.find(p => p.likes && p.likes.length > 0);

  if (postWithLikes) {
    console.log('Found post with likes:', postWithLikes.$id);
    const firstLike = postWithLikes.likes[0];
    const userId = typeof firstLike === 'string' ? firstLike : firstLike.$id;
    console.log('Fetching user:', userId);
    const userRes = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_USER_COLLECTION_ID + '/documents/' + userId, { headers });
    const userData = await userRes.json();
    console.log('User documents keys:', Object.keys(userData));
    if (userData.liked) {
        console.log('User liked posts:', userData.liked.map(p => p.$id));
    } else {
        console.log('User.liked is undefined');
    }
  } else {
    console.log('No posts with likes found.');
  }
}
verify();
