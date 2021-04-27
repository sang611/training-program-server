const jwt = require("jsonwebtoken");
const messages = require("../lib/constants/messages");

module.exports = (req, res, next) => {
  try {
    let access_token = req.cookies.access_token || (req.headers.authorization.split(" ")[1])
    if (access_token) {
      const decoded = jwt.verify(access_token, process.env.JWT_KEY);
      console.log(decoded)
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
