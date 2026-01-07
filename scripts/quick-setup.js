#!/usr/bin/env node
/**
 * Quick Setup & Verify Script
 * Run this after deploying to a new environment
 */

import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if(line && !line.startsWith('#')) {
    const parts = line.split('=');
    if(parts.length === 2) env[parts[0].trim()] = parts[1].trim();
  }
});

const ENDPOINT = env.VITE_APPWRITE_URL;
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const LIKES_COLLECTION_ID = env.VITE_APPWRITE_LIKES_COLLECTION_ID;

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(method, path, body = null) {
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${ENDPOINT}${path}`, options);
  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || response.statusText);
  return data;
}

async function quickSetup() {
  console.log('🚀 QUICK SETUP & VERIFY\n');
  console.log('This script will:');
  console.log('  1. Run setup.js to create database & relationships');
  console.log('  2. Run fix-permissions.js to set "any" permissions');
  console.log('  3. Run diagnose-likes.js to verify everything\n');

  const { spawn } = await import('child_process');

  const scripts = ['setup.js', 'fix-permissions.js', 'diagnose-likes.js'];

  for (const script of scripts) {
    console.log(`\n📋 Running ${script}...`);
    console.log('─'.repeat(60));
    
    await new Promise((resolve, reject) => {
      const proc = spawn('node', [`scripts/${script}`], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      proc.on('close', (code) => {
        if (code !== 0) reject(new Error(`${script} exited with code ${code}`));
        else resolve();
      });
    });
  }

  console.log('\n' + '─'.repeat(60));
  console.log('✅ SETUP COMPLETE!\n');
  console.log('Your social media app is ready to use.');
  console.log('Like functionality is fully operational.\n');
}

quickSetup().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
