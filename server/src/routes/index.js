const express = require("express");

const userRoutes = require("./user.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
  });
});

router.use("/users", userRoutes);

module.exports = router;