import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI in .env.local");
}

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      };
    }
  }
}

let cached = (globalThis as any).mongoose;

if (!cached) {
  (globalThis as any).mongoose = { conn: null, promise: null };
  cached = (globalThis as any).mongoose;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    try {
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
  return cached.conn;
}

