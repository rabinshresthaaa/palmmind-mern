const express = require("express");

const {
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();


// Current logged-in user
router.get(
  "/me",
  protect,
  getMe
);


// Admin: get all users
router.get(
  "/",
  protect,
  authorize("admin"),
  getUsers
);


// Admin: get specific user
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);


// User can update themselves
// Admin can update anyone
router.put(
  "/:id",
  protect,
  updateUser
);


// Admin can delete users
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);


module.exports = router;