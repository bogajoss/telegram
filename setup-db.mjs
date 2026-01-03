import { Client, Databases, Storage, ID, Permission, Role } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // Need a server-side API Key with Database & Storage 'write' permissions

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "telegram_clone_db";
const BUCKET_MEDIA = process.env.NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID || "media";
const BUCKET_AVATARS = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID || "avatars";

const COLLECTIONS = {
  users: {
    name: "Users",
    id: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "users",
    attributes: [
      { key: "username", type: "string", size: 255, required: true },
      { key: "display_name", type: "string", size: 255, required: true },
      { key: "bio", type: "string", size: 500, required: false },
      { key: "phone", type: "string", size: 50, required: false },
      { key: "avatar", type: "string", size: 500, required: false },
      { key: "accent_color", type: "string", size: 20, required: false, default: "#3390ec" },
      { key: "dark_mode", type: "boolean", required: false, default: false },
      { key: "last_seen", type: "datetime", required: false },
    ],
    indexes: [
        { key: "username", type: "unique", attributes: ["username"] }
    ]
  },
  chats: {
    name: "Chats",
    id: process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID || "chats",
    attributes: [
      { key: "name", type: "string", size: 255, required: true },
      { key: "avatar", type: "string", size: 500, required: false },
      { key: "type", type: "string", size: 20, required: true }, // private, group, channel
      { key: "members", type: "string", size: 255, required: true, array: true },
      { key: "last_message", type: "string", size: 1000, required: false },
      { key: "last_message_time", type: "datetime", required: false },
      { key: "created_by", type: "string", size: 255, required: true },
      { key: "muted", type: "boolean", required: false, default: false },
      { key: "pinnedMessageId", type: "string", size: 255, required: false },
      { key: "typing_data", type: "string", size: 5000, required: false }, // JSON string
      { key: "online", type: "boolean", required: false, default: false },
      { key: "verified", type: "boolean", required: false, default: false },
      { key: "description", type: "string", size: 500, required: false },
      { key: "link", type: "string", size: 500, required: false },
      { key: "archived", type: "boolean", required: false, default: false },
      { key: "blocked", type: "boolean", required: false, default: false },
    ],
  },
  messages: {
    name: "Messages",
    id: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID || "messages",
    attributes: [
      { key: "chat_id", type: "string", size: 255, required: true },
      { key: "sender_id", type: "string", size: 255, required: true },
      { key: "sender_name", type: "string", size: 255, required: true },
      { key: "text", type: "string", size: 5000, required: true },
      { key: "type", type: "string", size: 20, required: true }, // text, image, voice, etc.
      { key: "file_url", type: "string", size: 1000, required: false },
      { key: "reply_to", type: "string", size: 255, required: false },
      { key: "reactions", type: "string", size: 2000, required: false }, // JSON string
      { key: "created_at", type: "datetime", required: true },
    ],
    indexes: [
        { key: "chat_id", type: "key", attributes: ["chat_id"] }
    ]
  },
};

async function setup() {
  console.log("🚀 Starting Appwrite Database Setup...");

  // 1. Create Database
  try {
    await databases.get(DATABASE_ID);
    console.log(`✅ Database "${DATABASE_ID}" already exists.`);
  } catch (error) {
    await databases.create(DATABASE_ID, "Telegram Clone DB");
    console.log(`✅ Created Database: ${DATABASE_ID}`);
  }

  // 2. Create Collections & Attributes
  for (const [key, config] of Object.entries(COLLECTIONS)) {
    try {
      await databases.getCollection(DATABASE_ID, config.id);
      console.log(`✅ Collection "${config.name}" already exists.`);
    } catch (error) {
      await databases.createCollection(
        DATABASE_ID,
        config.id,
        config.name,
        [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
      );
      console.log(`✅ Created Collection: ${config.name}`);
    }

    // Create Attributes
    for (const attr of config.attributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(DATABASE_ID, config.id, attr.key, attr.size, attr.required, attr.default, attr.array);
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(DATABASE_ID, config.id, attr.key, attr.required, attr.default, attr.array);
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(DATABASE_ID, config.id, attr.key, attr.required, attr.default, attr.array);
        }
        console.log(`   🔹 Added Attribute: ${attr.key}`);
        // Small delay to prevent race conditions in Appwrite
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        // Attribute likely exists
      }
    }
    
    // Create Indexes
    if(config.indexes) {
        for(const idx of config.indexes) {
            try {
                await databases.createIndex(DATABASE_ID, config.id, idx.key, idx.type, idx.attributes);
                console.log(`   🔹 Added Index: ${idx.key}`);
            } catch (e) {}
        }
    }
  }

  // 3. Create Storage Buckets
  const buckets = [
      { id: BUCKET_MEDIA, name: "Media" }, 
      { id: BUCKET_AVATARS, name: "Avatars" }
  ];

  for (const bucket of buckets) {
    try {
      await storage.getBucket(bucket.id);
      console.log(`✅ Bucket "${bucket.name}" already exists.`);
    } catch (error) {
      await storage.createBucket(
          bucket.id, 
          bucket.name,
          [
              Permission.read(Role.any()),
              Permission.create(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users()),
          ],
          false, // fileSecurity
          true,  // enabled
          undefined, // maxFileSize
          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mp3', 'wav'] // allowedExtensions
      );
      console.log(`✅ Created Bucket: ${bucket.name}`);
    }
  }

  console.log("🎉 Setup Complete! Don't forget to restart your Next.js server.");
}

setup().catch(console.error);
