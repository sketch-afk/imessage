# iMessage Clone

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

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd imessage
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory with the following variables:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## 📜 Scripts

### Backend
- `npm run dev`: Starts the backend server using nodemon.
- `npm run start`: Starts the backend server in production mode.
- `npm run db:seed`: Seeds the database with initial user data.
- `npm run db:unseed`: Clears seeded data from the database.

### Frontend
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code issues.

## 📝 License
This project is licensed under the ISC License.
