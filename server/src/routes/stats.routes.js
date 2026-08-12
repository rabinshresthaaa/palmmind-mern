const express = require("express");

const {
  getStats,
} = require("../controllers/stats.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin"),
  getStats
);

module.exports = router;