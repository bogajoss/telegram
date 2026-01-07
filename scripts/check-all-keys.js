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
async function check() {
  const postId = '695dec32001769fe7305';
  const resP = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_POST_COLLECTION_ID + '/documents/' + postId, { headers });
  const p = await resP.json();
  console.log('Post keys:', Object.keys(p));

  const userId = '695debd000236e4e3132';
  const resU = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_USER_COLLECTION_ID + '/documents/' + userId, { headers });
  const u = await resU.json();
  console.log('User keys:', Object.keys(u));
}
check();
