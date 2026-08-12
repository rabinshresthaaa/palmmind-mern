const Message = require("../models/Message");


// GET CHAT HISTORY
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};


// CREATE MESSAGE
const createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      content,
    });

    const populatedMessage = await message.populate(
      "sender",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getMessages,
  createMessage,
};