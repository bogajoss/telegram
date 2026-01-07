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
async function test() {
  const postsRes = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_POST_COLLECTION_ID + '/documents', { headers });
  const postsData = await postsRes.json();
  const postId = postsData.documents[0].$id;
  const userId = '695debd000236e4e3132';

  console.log(`Updating post ${postId} likes with user ${userId}`);

  const updateRes = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_POST_COLLECTION_ID + '/documents/' + postId, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ likes: [userId] })
  });
  const updatedPost = await updateRes.json();
  
  if (updatedPost.likes) {
    console.log('Update successful. Likes count:', updatedPost.likes.length);
  } else {
    console.log('Update failed or likes missing in response:', JSON.stringify(updatedPost));
  }
}
test();
