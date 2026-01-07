#!/usr/bin/env node
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if(line && !line.startsWith('#')) {
    const parts = line.split('=');
    if(parts.length === 2) env[parts[0].trim()] = parts[1].trim();
  }
});

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': env.APPWRITE_API_KEY,
};

const resp = await fetch(`${env.VITE_APPWRITE_URL}/databases/${env.VITE_APPWRITE_DATABASE_ID}/collections/likes/documents`, {method: 'GET', headers});
const data = await resp.json();
console.log('First Like Document:');
console.log(JSON.stringify(data.documents[0], null, 2));
