const jwt = require("jsonwebtoken");
const messages = require("../lib/constants/messages");

module.exports = (req, res, next) => {
  try {
    if (req.cookies.access_token) {
      const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_KEY);
      req.role = decoded.role;
      next();
    } else {
      return res.status(401).json({
        message: messages.MSG_UNAUTHORIZED,
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: messages.MSG_UNAUTHORIZED,
    });
  }
};
