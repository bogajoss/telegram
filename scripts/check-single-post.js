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
  const res = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_POST_COLLECTION_ID + '/documents/' + postId, { headers });
  const p = await res.json();
  console.log(`Post ${p.$id}:`);
  console.log(`  Likes attribute type: ${typeof p.likes}`);
  console.log(`  Likes content: ${JSON.stringify(p.likes, null, 2)}`);
}
check();
