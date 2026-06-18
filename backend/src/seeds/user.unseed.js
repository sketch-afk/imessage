import "dotenv/config";

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

async function unseedDatabase() {
  await connectDB();

  // Deletes any user where the clerkId starts with "seed_"
  const result = await User.deleteMany({
    clerkId: { $regex: /^seed_/ },
  });

  console.log(`Unseeded users. Deleted: ${result.deletedCount} users.`);
}

unseedDatabase()
  .catch((error) => {
    console.error("Failed to unseed users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
