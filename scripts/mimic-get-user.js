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
  const res = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_USER_COLLECTION_ID + '/documents', { headers });
  const data = await res.json();
  const user = data.documents[0];
  console.log('User ID:', user.$id);
  console.log('User liked attribute type:', typeof user.liked);
  console.log('User liked attribute:', JSON.stringify(user.liked, null, 2));
}
test();
