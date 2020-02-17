const messages = require('../lib/constants/messages');

module.exports = (role) => {
  return (req, res, next) => {
    if (req.role > role) {
      return res.status(403).json({
        message: messages.MSG_FORBIDDEN
      });
    }
    next();
  }
}