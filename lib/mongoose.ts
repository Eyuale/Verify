import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect(uri, {
    dbName: "verifyDb", // Match case with connection string
    serverSelectionTimeoutMS: 30000, // 30s timeout
    connectTimeoutMS: 30000,
  });

  return cachedConnection;
}
  