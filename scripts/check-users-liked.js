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
  const res = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_USER_COLLECTION_ID + '/documents', { headers });
  const data = await res.json();
  for (const user of data.documents) {
    console.log(`User: ${user.username} (${user.$id})`);
    // Try to get individual doc
    const docRes = await fetch(env.VITE_APPWRITE_URL + '/databases/' + env.VITE_APPWRITE_DATABASE_ID + '/collections/' + env.VITE_APPWRITE_USER_COLLECTION_ID + '/documents/' + user.$id, { headers });
    const doc = await docRes.json();
    console.log(`  Liked count: ${doc.liked ? doc.liked.length : 'undefined'}`);
  }
}
check();
