const express = require("express");

const {
  createUser, getMe
} = require("../controllers/user.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", createUser);

router.get("/me", protect, getMe);

module.exports = router;