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
async function cleanup() {
  const dbId = env.VITE_APPWRITE_DATABASE_ID;
  const postColId = env.VITE_APPWRITE_POST_COLLECTION_ID;
  const userColId = env.VITE_APPWRITE_USER_COLLECTION_ID;

  try {
    console.log("Deleting relationship 'likes' from posts...");
    await fetch(`${env.VITE_APPWRITE_URL}/databases/${dbId}/collections/${postColId}/attributes/likes`, { method: 'DELETE', headers });
    
    console.log("Deleting relationship 'liked' from users...");
    await fetch(`${env.VITE_APPWRITE_URL}/databases/${dbId}/collections/${userColId}/attributes/liked`, { method: 'DELETE', headers });
    
    console.log("Waiting for Appwrite to sync...");
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error(e);
  }
}
cleanup();
