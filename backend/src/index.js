import express from 'express'
import cors from 'cors';

import "dotenv/config"

import fs from 'fs';
import path from 'path';
import job from './lib/cron.js';



import { clerkMiddleware } from '@clerk/express'

import User from "./models/user.model.js"
import { connectDB } from './lib/db.js'

const app = express()
const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL

const publicDir = path.join(process.cwd(), "public");

app.use(express.json())
app.use(cors({origin:FRONTEND_URL, credentials:true}))
app.use(clerkMiddleware())

app.get("/health", (req, res)=>{
  res.status(200).json({ok:true})
})

// if the public directory exist, serve the static files
// this is for the production build
if(fs.existsSync(publicDir)){
  app.use(express.static(publicDir))

  app.get("/{*any}", (req, res, next)=>{
    res.sendFile(path.join(publicDir, "index.html"), (err)=> next(err));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening on port ${PORT}`)

  if(process.env.NODE_ENV === "production"){
    job.start()
  }
})

// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server is listening on port ${PORT}`)
//     })
//   } catch (error) {
//     console.error("Database connection failed. Server not started.", error);
//     process.exit(1);
//   }
// }

// startServer();