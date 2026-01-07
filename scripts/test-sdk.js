import { Client, Databases } from "appwrite";
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"']*)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});

const client = new Client()
    .setEndpoint(env.VITE_APPWRITE_URL)
    .setProject(env.VITE_APPWRITE_PROJECT_ID);
// No setKey in client SDK, but we are running in node, we should use server SDK if we want admin access.
// But the app uses client SDK. Let's use the REST API with the API_KEY as I did before.

async function test() {
    const headers = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': env.APPWRITE_API_KEY,
    };
    const userId = '695debd000236e4e3132';
    const res = await fetch(`${env.VITE_APPWRITE_URL}/databases/${env.VITE_APPWRITE_DATABASE_ID}/collections/${env.VITE_APPWRITE_USER_COLLECTION_ID}/documents/${userId}`, { headers });
    const user = await res.json();
    console.log('User liked posts:', user.liked);
}
test();
