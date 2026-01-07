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
  const userId = '695debd000236e4e3132';
  // Try search query instead of equal
  const res = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_POST_COLLECTION_ID + '/documents', { headers });
  const data = await res.json();
  const liked = data.documents.filter(p => p.likes && p.likes.some(u => (u.$id || u) === userId));
  console.log('Manually filtered liked posts:', liked.length);
}
test();
