#!/usr/bin/env node
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if(line && !line.startsWith('#')) {
    const [k,v] = line.split('=');
    if(k && v) env[k.trim()] = v.trim();
  }
});

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': env.APPWRITE_API_KEY,
};

const resp = await fetch(`${env.VITE_APPWRITE_URL}/databases/${env.VITE_APPWRITE_DATABASE_ID}/collections/likes`, {method: 'GET', headers});
const data = await resp.json();
console.log('Likes Collection Permissions:');
console.log(JSON.stringify(data.permissions, null, 2));
