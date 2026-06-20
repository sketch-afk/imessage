# 💬 Full Stack Real-Time Chat App 🚀

A full-stack, real-time messaging application inspired by iMessage. Built with modern web technologies, featuring instant messaging, secure authentication, and image sharing.

## 🌟 Features

- **Real-time Messaging**: Instant message delivery using Socket.IO.
- **Secure Authentication**: User authentication and management powered by Clerk.
- **Media Sharing**: Upload and share images within chats, handled by ImageKit.
- **Modern UI**: A responsive, sleek interface built with React, Tailwind CSS, and HeroUI.
- **Global State Management**: Efficient state handling using Zustand.
- **RESTful API**: Robust backend built with Node.js, Express, and MongoDB.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4, HeroUI
- **State Management**: Zustand
- **Routing**: React Router
- **Real-time**: Socket.IO Client
- **Auth**: Clerk React
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO
- **Auth**: Clerk Express
- **File Uploads**: Multer, ImageKit

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- Clerk account for authentication (Publishable and Secret keys)
- ImageKit account for media storage

## 🧪 Environment Variables

### Backend (`/backend`)

```bash
PORT=<your_port>

NODE_ENV=<development_or_production>

MONGO_URI=<your_mongodb_connection_string>

CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
CLERK_WEBHOOK_SIGNING_SECRET=<your_clerk_webhook_signing_secret>

IMAGEKIT_PRIVATE_KEY=<your_imagekit_private_key>

FRONTEND_URL=<your_frontend_url>
```

### Frontend (`/frontend`)

```bash
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
```

---

## 📝 License
This project is licensed under the ISC License.
