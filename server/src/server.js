const dotenv = require("dotenv");
const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket = require("./socket");

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = initializeSocket(server);

connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});