import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export async function connectDB() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    } else if (mongoose.connection.readyState >= 1) {
        console.log("Already connected to MongoDB");
        return;
    } else {
        return mongoose.connect(MONGO_URI);
    }
}