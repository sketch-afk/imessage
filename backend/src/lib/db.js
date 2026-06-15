import mongoose from "mongoose";


export async function connectDB() {
    // 1. Check if we already have an active or connecting instance
    // if (mongoose.connection.readyState === 1) {
    //     console.log("MongoDB is already connected.");
    //     return;
    // }
    // if (mongoose.connection.readyState === 2) {
    //     console.log("MongoDB is currently connecting...");
    //     return;
    // }
    try{
        const mongoUri = process.env.MONGO_URI;
        if(!mongoUri){
            throw new Error("MONGO_URI is required")
        }

        const conn = await mongoose.connect(mongoUri)
        console.log("Connected to MongoDB", conn.connection.host)
    }
    catch(error){
        console.log('MongoDB connection error:',error instanceof Error ? error.message : error)
        process.exit(1);
    }
}