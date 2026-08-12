const express = require("express");

const {
  getMessages,
  createMessage,
} = require("../controllers/message.controller");

const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createMessageSchema,
} = require("../validators/message.validator");

const router = express.Router();


// Get chat history
router.get(
  "/",
  protect,
  getMessages
);


// Create a message
router.post(
  "/",
  protect,
  validate(createMessageSchema),
  createMessage
);


module.exports = router;