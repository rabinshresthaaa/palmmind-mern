const express = require("express");

const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes");
const messageRoutes = require("./message.routes");
const statsRoutes = require("./stats.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
  });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);
router.use("/stats", statsRoutes);

module.exports = router;