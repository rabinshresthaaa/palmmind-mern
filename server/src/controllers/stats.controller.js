const User = require("../models/User");
const Message = require("../models/Message");

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalChats] = await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalChats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};