import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function editMessage(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== senderId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this message" });
    }

    if (message.image || message.video) {
      return res
        .status(400)
        .json({
          message: "Cannot edit media messages. Please delete instead.",
        });
    }

    const ONE_HOUR = 3600000; // 1 hour in milliseconds
    if (Date.now() - new Date(message.createdAt).getTime() > ONE_HOUR) {
      return res
        .status(403)
        .json({
          message:
            "Time limit exceeded. Messages can only be edited within 1 hour.",
        });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in editMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const senderId = req.user._id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== senderId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this message" });
    }

    const ONE_HOUR = 3600000;
    if (Date.now() - new Date(message.createdAt).getTime() > ONE_HOUR) {
      return res
        .status(403)
        .json({
          message:
            "Time limit exceeded. Messages can only be deleted within 1 hour.",
        });
    }

    message.isDeleted = true;
    message.text = "";
    message.image = "";
    message.video = "";
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },

      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $last: "$$ROOT" },
        },
      },

      { $sort: { lastMessage: -1 } },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      { $replaceRoot: { newRoot: { $first: "$user" } } },

      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (e) {
    console.error("Error in getMessages:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res
          .status(500)
          .json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      } else {
        imageUrl = url;
      }
    }

    const receiverSocketId = getReceiverSocketId(receiverId);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      status: receiverSocketId ? "delivered" : "sent",
    });

    await newMessage.save();

    // only send the message in realtime if user is online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (e) {
    console.error("Error in sendMessage:", e.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markMessagesSeen(req, res) {
  try {
    const { conversationId } = req.params; // This is the ID of the person you are chatting with
    const myId = req.user._id;

    // Update all messages sent BY them TO you, where status is not already 'seen'
    const result = await Message.updateMany(
      {
        senderId: conversationId,
        receiverId: myId,
        status: { $ne: "seen" },
      },
      {
        $set: { status: "seen" },
      }
    );

    if (result.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(conversationId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { receiverId: myId });
      }
    }

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error("Error in markMessagesSeen:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
