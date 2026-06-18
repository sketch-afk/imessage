import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, { cors: { origin: [allowedOrigin] } });

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  if (userId) {
    try {
      // 1. Find all distinct users who sent messages to this user that are currently "sent"
      const senders = await Message.distinct("senderId", {
        receiverId: userId,
        status: "sent",
      });

      if (senders.length > 0) {
        // 2. Update all those messages to "delivered"
        await Message.updateMany(
          { receiverId: userId, status: "sent" },
          { $set: { status: "delivered" } },
        );

        // 3. Notify the senders (if they are online) that their messages were delivered
        senders.forEach((senderId) => {
          const senderSocketId = getReceiverSocketId(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("messagesDelivered", {
              receiverId: userId,
            });
          }
        });
      }
    } catch (error) {
      console.error("Error updating message delivery status:", error);
    }
  }

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };
