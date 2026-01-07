import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_APPWRITE_URL': JSON.stringify(process.env.VITE_APPWRITE_URL),
    'import.meta.env.VITE_APPWRITE_PROJECT_ID': JSON.stringify(process.env.VITE_APPWRITE_PROJECT_ID),
    'import.meta.env.VITE_APPWRITE_DATABASE_ID': JSON.stringify(process.env.VITE_APPWRITE_DATABASE_ID),
    'import.meta.env.VITE_APPWRITE_STORAGE_ID': JSON.stringify(process.env.VITE_APPWRITE_STORAGE_ID),
    'import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID': JSON.stringify(process.env.VITE_APPWRITE_USER_COLLECTION_ID),
    'import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID': JSON.stringify(process.env.VITE_APPWRITE_POST_COLLECTION_ID),
    'import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID': JSON.stringify(process.env.VITE_APPWRITE_SAVES_COLLECTION_ID),
    'import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID': JSON.stringify(process.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID),
  },
});
