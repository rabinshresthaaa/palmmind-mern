const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTdjMzg4YmUxNDZmMjY2Zjk0NmNiYzciLCJpYXQiOjE3ODY1MzAzNDEsImV4cCI6MTc4NzEzNTE0MX0.s-7qAa49Dn5l3WqrS3OXdt8IDqI1zo7zwVfTRldEvv4";

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("message:send", {
    content: "Hello from Socket.IO!",
  });
});

socket.on("user:join", (data) => {
  console.log("USER JOINED:", data);
});

socket.on("message:receive", (data) => {
  console.log("MESSAGE RECEIVED:");
  console.log(data);
});

socket.on("message:error", (data) => {
  console.log("MESSAGE ERROR:", data);
});

socket.on("user:leave", (data) => {
  console.log("USER LEFT:", data);
});

socket.on("connect_error", (error) => {
  console.log("CONNECTION ERROR:", error.message);
});