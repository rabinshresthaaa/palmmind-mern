const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Message = require("../models/Message");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // SOCKET AUTHENTICATION

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.userId).select(
        "-password"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // CONNECTION
  io.on("connection", (socket) => {
    console.log(
      `User connected: ${socket.user.name} (${socket.id})`
    );

    // USER JOIN
    socket.broadcast.emit("user:join", {
      user: {
        id: socket.user._id,
        name: socket.user.name,
      },
      message: `${socket.user.name} joined the chat`,
    });

    // SEND MESSAGE
    socket.on("message:send", async (data) => {
      try {
        const content = data?.content?.trim();

        if (!content) {
          return socket.emit("message:error", {
            message: "Message content is required",
          });
        }

        if (content.length > 1000) {
          return socket.emit("message:error", {
            message: "Message cannot exceed 1000 characters",
          });
        }

        // Save message to MongoDB
        const message = await Message.create({
          sender: socket.user._id,
          content,
        });

        // Populate sender
        const populatedMessage = await message.populate(
          "sender",
          "name email role"
        );

        // Send message to everyone
        io.emit("message:receive", {
          message: populatedMessage,
        });

      } catch (error) {
        console.error("Socket message error:", error);

        socket.emit("message:error", {
          message: "Failed to send message",
        });
      }
    });


    // USER LEAVE
    socket.on("user:leave", () => {
        socket.disconnect();
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(
        `User disconnected: ${socket.user.name}`
      );

      socket.broadcast.emit("user:leave", {
        user: {
          id: socket.user._id,
          name: socket.user.name,
        },
        message: `${socket.user.name} left the chat`,
      });
    });
  });


  return io;
};

module.exports = initializeSocket;